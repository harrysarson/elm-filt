export const supportedElmVersions = [
	// '0.18.0',
	'0.19.0',
	'0.19.1'
];

export class ElmFiltError extends Error {
	constructor(...args) {
		super(args);
		this.elmFiltError = true;
	}
}
export class ParseDefinitionError extends ElmFiltError {
	constructor(...args) {
		super(args);
	}
}

export class UnsupportedVersionError extends ElmFiltError {
	constructor(...args) {
		super(args);
	}
}

export function detectElmVersion(source) {
	const checks = {
		'0.19.x': [
			source.includes('_Platform_export'),
			source.includes('elm$core$Basics')
		],
		'0.18.0': [source.includes('globalElm'), source.includes('Native')],
		'<0.18.0': [!source.includes('Tuple')]
	};

	const check = version =>
		Object.keys(checks)
			.map(checkVersion =>
				(checkVersion === version
					? l => l.every(x => x)
					: l => !l.some(x => x))(checks[checkVersion])
			)
			.every(x => x);

	if (check('0.19.x')) {
		if (source.includes('var $elm$core$')) {
			return '0.19.1';
		}

		if (source.includes('var elm$core$')) {
			return '0.19.0';
		}
	}

	if (check('0.18.0')) {
		throw Object.assign(
			new UnsupportedVersionError(
				'elm-filt does not support elm 0.18.0. Sorry!'
			),
			{supportedElmVersions}
		);
	}

	throw Object.assign(
		new ElmFiltError(
			'JavaScript is not recognised as the output of a supported elm compiler'
		),
		{supportedElmVersions}
	);
}

export const filters = {
	'0.19.0': ({source, keeps}) => {
		const lines = source.split('\n').filter(line => line !== '');
		const trimmed = trimElmJs['0.19.0'](lines);
		const definitions = definitionsFromElmJs['0.19.0'](trimmed);

		return keeps.reduce((arr, keep) => {
			const oldStyleKeep = parseDefinition(keep)
				.flat()
				.join('$');
			arr.push({
				elmIdentifier: keep,
				javascript: getDefinitionWithName(definitions, oldStyleKeep)
			});
			return arr;
		}, []);
	}
};

export const trimElmJs = {
	'0.19.0': lines => {
		const frontMatter = ['(function(scope){', "'use strict';"];
		const endMatter = '}(this));';

		if (!arraysEqual(lines.slice(0, 2), frontMatter)) {
			throw new ElmFiltError(
				`The following start of the elm file is not valid:\n${lines
					.slice(0, 10)
					.join('\n')}\n...`
			);
		}

		if (!lines[lines.length - 1].endsWith(endMatter)) {
			throw new ElmFiltError(
				`The following end to the elm file is not valid:\n...\n${lines
					.slice(-5)
					.join('\n')}`
			);
		}

		const trimmed = lines.slice(frontMatter.length);
		trimmed[trimmed.length - 1] = trimmed[trimmed.length - 1].slice(
			0,
			-endMatter.length
		);
		return trimmed;
	}
};

export const definitionsFromElmJs = {
	'0.19.0': lines => {
		const definitions = [];
		const current = lines.slice(0, 1);

		for (let i = 1; i < lines.length; ++i) {
			const isNewDefinition =
				lines[i].startsWith('function') ||
				lines[i].startsWith('var') ||
				lines[i].startsWith('_Platform_export');

			if (isNewDefinition) {
				definitions.push(current.join('\n'));
				current.length = 0;
			}

			current.push(lines[i]);
		}

		definitions.push(current.join('\n'));
		return definitions;
	}
};

export function commaList(list) {
	if (list.length <= 1) {
		return list.join('');
	}

	const last = list[list.length - 1];
	return `${list.slice(0, -1).join(', ')} and ${last}`;
}

export function parseDefinition(input) {
	const parts = input.split(':', 2);
	return parts.length > 1
		? (() => {
				const authorPackageParts = parts[0].split('/', 2);
				const author = authorPackageParts[0];
				const pkg = authorPackageParts[1];
				if (!isValidGithubUsername(author)) {
					throw new ParseDefinitionError(
						`The author specified in the definition "${input}" is "${author}" which is not valid.`
					);
				}

				if (!isValidGithubRepo(pkg)) {
					throw new ParseDefinitionError(
						`The pkg specified in the definition "${input}" is "${pkg}" which is not valid.`
					);
				}

				return [author, pkg, getElmParts(parts[1])];
		  })()
		: (() => {
				return ['author', 'project', getElmParts(parts[0])];
		  })();
}

export function getElmParts(string) {
	const elmParts = string.split('.');
	if (elmParts.length === 1) {
		throw new ParseDefinitionError(
			`The elm definition ("${string}") requires atleast one Module name folowed by a full stop and a value.`
		);
	}

	const invalidParts = listInvalidElmParts(elmParts);
	if (invalidParts.length > 0) {
		throw new ParseDefinitionError(
			`The elm definition "${string}" is not valid ${
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

function getDefinitionWithName(definitions, name) {
	const defs = definitions.filter(
		str => str.startsWith(`var ${name} `) || str.startsWith(`function ${name}(`)
	);
	if (defs.length === 0) {
		throw new ElmFiltError(`No definitions with name "${name}"`);
	} else if (defs.length > 1) {
		throw Object.assign(
			new ElmFiltError(`Multiple definitions with name "${name}"`),
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
