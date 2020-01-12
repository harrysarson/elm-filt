export class ElmFiltError extends Error {
	constructor(...args) {
		super(args);
		this.elmFiltError = true;
	}
}

export class ParseSpecifierError extends ElmFiltError {
	constructor(...args) {
		super(args);
	}
}

export class UnsupportedVersionError extends ElmFiltError {
	constructor(...args) {
		super(args);
	}
}

export class ElmSpecifier {
	constructor({author, pkg, elmParts}) {
		this.author = author;
		this.pkg = pkg;
		this.elmParts = elmParts;
	}
}

function trimElm019help(lines) {
	const frontMatter = ['(function(scope){', "'use strict';"];
	const endMatter = '}(this));';

	if (!arraysEqual(lines.slice(0, 2).map(l => l.contents), frontMatter)) {
		throw new ElmFiltError(
			`The following start of the elm file is not valid:\n${lines
				.slice(0, 10)
				.map(l => l.contents)
				.join('\n')}\n...`
		);
	}

	if (!lines[lines.length - 1].contents.endsWith(endMatter)) {
		throw new ElmFiltError(
			`The following end to the elm file is not valid:\n...\n${lines
				.slice(-5)
				.map(l => l.contents)
				.join('\n')}`
		);
	}

	const trimmed = lines.slice(frontMatter.length);
	trimmed[trimmed.length - 1].contents = trimmed[
		trimmed.length - 1
	].contents.slice(0, -endMatter.length);
	return trimmed;
}

function definitionsFromElmJs019help(lines) {
	const definitions = [];
	const current = lines.slice(0, 1);

	for (let i = 1; i < lines.length; ++i) {
		const isNewDefinition =
			lines[i].contents.startsWith('function') ||
			lines[i].contents.startsWith('var') ||
			lines[i].contents.startsWith('_Platform_export');

		if (isNewDefinition) {
			definitions.push(current.slice());
			current.length = 0;
		}

		current.push(lines[i]);
	}

	definitions.push(current);
	return definitions;
}

export const trimElmJs = {
	'0.19.0': trimElm019help,
	'0.19.1': trimElm019help
};

export const definitionsFromElmJs = {
	'0.19.0': definitionsFromElmJs019help,
	'0.19.1': definitionsFromElmJs019help
};

export function commaList(list) {
	if (list.length <= 1) {
		return list.join('');
	}

	const last = list[list.length - 1];
	return `${list.slice(0, -1).join(', ')} and ${last}`;
}

export class JsSpecifier {
	constructor(elm, kernel) {
		this.elm = elm;
		this.kernel = kernel;
		Object.freeze(this);
	}
}

export function jsFromSpecifier(elmVersion, {author, pkg, elmParts}) {
	const elmSpecifier = [
		author.replace('-', '_'),
		pkg.replace('-', '_'),
		...elmParts
	].join('$');
	const kernelSpecifier = `_${elmParts[elmParts.length - 2]}_${
		elmParts[elmParts.length - 1]
	}`;
	if (elmVersion !== '0.19.0' && elmVersion !== '0.19.1') {
		throw new Error('Invalid version');
	}

	return new JsSpecifier(
		`${elmVersion === '0.19.1' ? '$' : ''}${elmSpecifier}`,
		kernelSpecifier
	);
}

export function parseSpecifier(input) {
	const parts = input.split(':', 2);
	return parts.length > 1
		? (() => {
				const authorPackageParts = parts[0].split('/', 2);
				const author = authorPackageParts[0];
				const pkg = authorPackageParts[1];
				if (!isValidGithubUsername(author)) {
					throw new ParseSpecifierError(
						`The author specified in the specifier "${input}" is "${author}" which is not valid.`
					);
				}

				if (!isValidGithubRepo(pkg)) {
					throw new ParseSpecifierError(
						`The pkg specified in the specifier "${input}" is "${pkg}" which is not valid.`
					);
				}

				return new ElmSpecifier({author, pkg, elmParts: getElmParts(parts[1])});
		  })()
		: (() => {
				return new ElmSpecifier({
					author: 'author',
					pkg: 'project',
					elmParts: getElmParts(parts[0])
				});
		  })();
}

export function getElmParts(string) {
	const elmParts = string.split('.');
	if (elmParts.length === 1) {
		throw new ParseSpecifierError(
			`The elm specifier ("${string}") requires atleast one Module name folowed by a full stop and a value.`
		);
	}

	const invalidParts = listInvalidElmParts(elmParts);
	if (invalidParts.length > 0) {
		throw new ParseSpecifierError(
			`The elm specifier "${string}" is not valid ${
				elmParts.length > 1
					? `(specifically ${commaList(
							invalidParts.map(index => `"${elmParts[index]}"`)
					  )})`
					: ''
			}`
		);
	}

	return elmParts;
}

/**  All parts must start with captial letter apart from the last one.
 */
export function listInvalidElmParts(parts) {
	const {length} = parts;
	if (length === 0) {
		return [];
	}

	if (length === 1) {
		return [0];
	}

	return parts
		.map((part, index) => {
			if (
				[...part].every(char => isAlphaNumeric(char) || char === '_') &&
				(index + 1 === length ? isAlpha(part[0]) : isCaptial(part[0]))
			) {
				return undefined;
			}

			return index;
		})
		.filter(i => i !== undefined);
}

/**  Repository names may only contain alphanumeric character, hyphens or full stops.
 */
export function isValidGithubRepo(repo) {
	if (repo === '') {
		return false;
	}

	return [...repo].every(
		char => isAlphaNumeric(char) || char === '-' || char === '.'
	);
}

/**  Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.
 */
export function isValidGithubUsername(username) {
	if (username === '') {
		return false;
	}

	let prevWasHyphen = true;

	return (
		[...username].every(char => {
			if (isAlphaNumeric(char)) {
				prevWasHyphen = false;
				return true;
			}

			if (char === '-') {
				if (prevWasHyphen === true) {
					return false;
				}

				prevWasHyphen = true;
				return true;
			}

			return false;
		}) && !prevWasHyphen
	);
}

function isAlphaNumeric(char) {
	const code = char.charCodeAt(0);
	return (
		(code >= '0'.charCodeAt(0) && code <= '9'.charCodeAt(0)) || isAlpha(char)
	);
}

function isAlpha(char) {
	const code = char.charCodeAt(0);
	return (
		(code >= 'a'.charCodeAt(0) && code <= 'z'.charCodeAt(0)) || isCaptial(char)
	);
}

function isCaptial(char) {
	const code = char.charCodeAt(0);
	return code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0);
}

export function getDefinitionWithName(definitions, name) {
	const defs = definitions.filter(
		str =>
			str[0].contents.startsWith(`var ${name.elm} `) ||
			str[0].contents.startsWith(`function ${name.elm}(`) ||
			str[0].contents.startsWith(`var ${name.kernel} `) ||
			str[0].contents.startsWith(`function ${name.kernel}(`)
	);
	if (defs.length === 0) {
		throw new ElmFiltError(`No definitions with name "${name.elm}"`);
	} else if (defs.length > 1) {
		throw Object.assign(
			new ElmFiltError(`Multiple definitions with name "${name.elm}"`),
			{
				definitions: defs
			}
		);
	}

	return defs[0];
}

function arraysEqual(arr1, arr2) {
	// Check if the arrays are the same length
	if (arr1.length !== arr2.length) {
		return false;
	}

	// Check if all items exist and are in the same order
	for (const [i, element] of arr1.entries()) {
		if (element !== arr2[i]) {
			return false;
		}
	}

	// Otherwise, return true
	return true;
}
