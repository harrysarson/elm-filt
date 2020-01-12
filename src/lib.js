import {
	getDefinitionWithName,
	parseSpecifier,
	trimElmJs,
	definitionsFromElmJs,
	ElmFiltError,
	UnsupportedVersionError,
	jsFromSpecifier
} from './internal';

export {ElmFiltError, UnsupportedVersionError} from './internal';

export const supportedElmVersions = [
	// '0.18.0',
	'0.19.0',
	'0.19.1'
];

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

export function filter({source, keeps, assumeElmVersion}) {
	const elmVersion =
		assumeElmVersion === undefined || assumeElmVersion === null
			? detectElmVersion(source)
			: assumeElmVersion;
	const lines = source
		.split('\n')
		.map((line, i) => ({
			number: i,
			contents: line
		}))
		.filter(l => l.contents !== '')
		.filter(l => !/^\S*\/\//.test(l.contents));
	const trimmed = trimElmJs[elmVersion](lines);
	const definitions = definitionsFromElmJs[elmVersion](trimmed);
	return keeps
		.reduce((arr, keep) => {
			const specifier = parseSpecifier(keep);
			const jsKeep = jsFromSpecifier(elmVersion, specifier);
			const defs = getDefinitionWithName(definitions, jsKeep);
			arr.push({
				elmIdentifier: keep,
				start: defs[0].number,
				end: defs[defs.length - 1].number,
				javascript: defs.map(l => l.contents).join('\n')
			});
			return arr;
		}, [])
		.sort((lhs, rhs) => lhs.start - rhs.start);
}
