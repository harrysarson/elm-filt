import test from 'ava';
import {
	commaList,
	getElmParts,
	isValidGithubRepo,
	isValidGithubUsername,
	listInvalidElmParts,
	parseDefinition,
	ParseDefinitionError,
	trimElmJs
} from '../../src/internal';
import {
	detectElmVersion,
	supportedElmVersions,
	UnsupportedVersionError
} from '../../src/lib';
import * as fixtures from '../helpers/fixtures';

const skipTest = test.skip;

test('isValidGithubUsername: valid usernames', t => {
	for (const name of fixtures.usernames) {
		t.assert(isValidGithubUsername(name));
	}
});

test('isValidGithubUsername: usernames with invalid hyphens', t => {
	const usernames = ['-', 'H--6', '-6onso', '26262hb-'];
	for (const name of usernames) {
		t.assert(!isValidGithubUsername(name));
	}
});

test('isValidGithubUsername: empty username', t => {
	t.assert(!isValidGithubUsername(''));
});

test('isValidGithubUsername: invalid characters in username', t => {
	const chars = '!"£$%^&*()?.|~\\/`💩';
	for (const char of chars) {
		t.assert(!isValidGithubUsername(`alfred${char}the-great`));
	}
});

test('isValidGithubRepo: valid repos', t => {
	const repos = [
		'-',
		'H--6',
		'-6onso',
		'-',
		'125',
		'bbc',
		'-2352.34636--235235',
		'kadgfnaognaognOINIOJION214541OIJIONJ2-'
	];
	for (const name of repos) {
		t.assert(isValidGithubRepo(name));
	}
});

test('isValidGithubRepo: empty username', t => {
	t.assert(!isValidGithubRepo(''));
});

test('isValidGithubRepo: invalid characters in username', t => {
	const chars = '!"£$%^&*()?|~\\/`💩';
	for (const char of chars) {
		t.assert(!isValidGithubRepo(`alfred${char}the-great`));
	}
});

test('listInvalidElmParts: valid elm parts', t => {
	const partslist = [
		['Main', 'main'],
		['Dir', 'Dir', 'function'],
		['Dir', 'Lighthouse', 'Type'],
		['Dir', 'Dir', 'Dir', 'Dir', 'Dir', 'Dir', 'nope'],
		['Dir33', 'Di1r', 'Dir', 'Dir67', 'D4ir', 'Dir', 'n4ope']
	];
	for (const parts of partslist) {
		t.deepEqual(listInvalidElmParts(parts), [], parts.join('.'));
	}
});

test('listInvalidElmParts: invalid characters in elm parts', t => {
	const partslist = [
		[['M!ain', 'm$ain'], [0, 1]],
		[['Dir', 'Di£r', 'function'], [1]],
		[['Dir', 'Lighthouse', 'Ty&pe'], [2]],
		[['/Dir', 'Dir', 'Dir', 'Dir', 'Dir', 'Dir', 'nope'], [0]]
	];
	for (const parts of partslist) {
		t.deepEqual(listInvalidElmParts(parts[0]), parts[1], parts[0].join('.'));
	}
});

test('listInvalidElmParts: module elm parts start with lower case', t => {
	const partslist = [
		[['dir', 'Dir', 'function'], [0]],
		[['Dir', 'lighthouse', 'Type'], [1]],
		[['Dir', 'Dir', 'Dir', 'dir', 'Dir', 'Dir', 'nope'], [3]],
		[['dir33', 'Di1r', 'Dir', 'ir67', 'a4ir', 'ir', 'n4ope'], [0, 3, 4, 5]]
	];
	for (const parts of partslist) {
		t.deepEqual(listInvalidElmParts(parts[0]), parts[1], parts[0].join('.'));
	}
});

test('listInvalidElmParts: elm parts start with number', t => {
	const partslist = [
		[['Main', '5main'], [1]],
		[['5ir', 'Dir', 'function'], [0]],
		[['Dir', '6Lighthouse', '6ype'], [1, 2]],
		[['Dir', 'Dir', 'Dir', '141ir', 'Dir', 'Dir', 'nope'], [3]],
		[['0ir33', 'Di1r', 'Dir', '0r67', '1a4ir', '2ir', 'n4ope'], [0, 3, 4, 5]]
	];
	for (const parts of partslist) {
		t.deepEqual(listInvalidElmParts(parts[0]), parts[1], parts[0].join('.'));
	}
});

test('listInvalidElmParts: requires atleast 2 parts', t => {
	t.deepEqual(listInvalidElmParts(['main']), [0]);
});

test('commaList', t => {
	t.is(commaList([0, 1, 235, 235, 'n', true]), '0, 1, 235, 235, n and true');
});

test('commaList: no itema', t => {
	t.is(commaList([]), '');
});

test('commaList: one item', t => {
	t.is(commaList([0]), '0');
});

test('getElmParts: valid elm identifier', t => {
	const inputs = [
		['Module.main', ['Module', 'main']],
		[
			'Green.Trees.Produce.O2.From.co2',
			['Green', 'Trees', 'Produce', 'O2', 'From', 'co2']
		],
		['BBC.Type', ['BBC', 'Type']]
	];
	for (const input of inputs) {
		t.deepEqual(getElmParts(input[0]), input[1], input[0]);
	}
});

test('getElmParts: only one part', t => {
	t.throws(() => getElmParts('main'), ParseDefinitionError);
});

test('getElmParts: bad parts', t => {
	t.throws(() => getElmParts('ma4.main'), ParseDefinitionError);
	t.throws(() => getElmParts('4afsf.main'), ParseDefinitionError);
	t.throws(() => getElmParts('Ma4.4'), ParseDefinitionError);
	t.throws(() => getElmParts('Ma4.5.d4'), ParseDefinitionError);
});

test('parseDefinition: valid definition without author/project', t => {
	t.deepEqual(parseDefinition('Module.main'), {
		author: 'author',
		pkg: 'project',
		elmParts: ['Module', 'main']
	});
	t.deepEqual(parseDefinition('A.B.C.D'), {
		author: 'author',
		pkg: 'project',
		elmParts: ['A', 'B', 'C', 'D']
	});
	t.deepEqual(parseDefinition('H7.I8.hi2'), {
		author: 'author',
		pkg: 'project',
		elmParts: ['H7', 'I8', 'hi2']
	});
});

test('parseDefinition: valid definition with valid author/project', t => {
	t.deepEqual(parseDefinition('author/project:Module.main'), {
		author: 'author',
		pkg: 'project',
		elmParts: ['Module', 'main']
	});
	t.deepEqual(parseDefinition('elm/core:A.B.C.D'), {
		author: 'elm',
		pkg: 'core',
		elmParts: ['A', 'B', 'C', 'D']
	});
	t.deepEqual(parseDefinition('bob/marley:H7.I8.hi2'), {
		author: 'bob',
		pkg: 'marley',
		elmParts: ['H7', 'I8', 'hi2']
	});
	t.deepEqual(parseDefinition('bo-b/mar.le-y:H7.I8.hi2'), {
		author: 'bo-b',
		pkg: 'mar.le-y',
		elmParts: ['H7', 'I8', 'hi2']
	});
});

test('parseDefinition: bad definition without author/project', t => {
	t.throws(() => parseDefinition('ma4.main'), ParseDefinitionError);
	t.throws(() => parseDefinition('4afsf.main'), ParseDefinitionError);
	t.throws(() => parseDefinition('Ma4.4'), ParseDefinitionError);
	t.throws(() => parseDefinition('Ma4.5.d4'), ParseDefinitionError);
});

test('parseDefinition: bad definition with valid author/project', t => {
	t.throws(
		() => parseDefinition('author/pkg:module.main'),
		ParseDefinitionError
	);
	t.throws(() => parseDefinition('elm/core:A.B.C.5D'), ParseDefinitionError);
	t.throws(
		() => parseDefinition('bob/marley:H7.iI8.hi2'),
		ParseDefinitionError
	);
	t.throws(
		() => parseDefinition('bo-b/mar.le-y:H7.6I8.hi2'),
		ParseDefinitionError
	);
});

test('parseDefinition: bad definition with bad author/project', t => {
	t.throws(
		() => parseDefinition('au--thor/pkg:module.main'),
		ParseDefinitionError
	);
	t.throws(() => parseDefinition('elm/co&re:A.B.C.5D'), ParseDefinitionError);
	t.throws(() => parseDefinition('bob/:H7.iI8.hi2'), ParseDefinitionError);
	t.throws(
		() => parseDefinition('bob-/mar.le-y:H7.6I8.hi2'),
		ParseDefinitionError
	);
});

test('parseDefinition: valid definition with bad author/project', t => {
	t.throws(
		() => parseDefinition('au--thor/pkg:Module.main'),
		ParseDefinitionError
	);
	t.throws(() => parseDefinition('elm/co&re:A.B.C.D'), ParseDefinitionError);
	t.throws(() => parseDefinition('bob/:H7.I8.hi2'), ParseDefinitionError);
	t.throws(
		() => parseDefinition('bob-/mar.le-y:H7.I8.hi2'),
		ParseDefinitionError
	);
});

test('detectElmVersion: detect 0.19.0', async t => {
	const file = await fixtures.sources['0.19.0'];

	t.is(detectElmVersion(file), '0.19.0');
});

test('detectElmVersion: detect 0.19.1', async t => {
	const file = await fixtures.sources['0.19.1'];

	t.is(detectElmVersion(file), '0.19.1');
});

test('detectElmVersion: detect but throw error for 0.18.0', async t => {
	const file = await fixtures.sources['0.18.0'];

	t.throws(() => detectElmVersion(file), UnsupportedVersionError);
});

test('detectElmVersion: throws error with `supportedVersion` property if file is invalid', async t => {
	const files = await Promise.all([
		fixtures.sources['0.18.0'],
		fixtures.sources.text
	]);
	for (const file of files) {
		const e = t.throws(() => detectElmVersion(file));
		t.deepEqual(e.supportedElmVersions, supportedElmVersions);
	}
});

test('trimElmJs: trims 0.19.0', async t => {
	const file = await fixtures.sources['0.19.0'];
	const timmed = trimElmJs['0.19.0'](
		file.split('\n').filter(line => line !== '')
	);

	t.assert(!timmed.includes('use strict'));
	t.assert(!timmed.includes('_Platform_export'));
});

skipTest('trimElmJs: trims 0.19.1', async t => {
	const file = await fixtures.sources['0.19.1'];
	const timmed = trimElmJs['0.19.1'](file.split('\n'));

	t.assert(!timmed.contains('use strict'));
	t.assert(!timmed.contains('_Platform_export'));
});
