import test from 'ava';
import pkg from '../../package.json';
import {exec} from '../helpers/cli';

test(exec, '--version', async (program, t) => {
	const {stderr, stdout} = await program;
	t.is(stderr, '');
	t.is(stdout, `${pkg.version}\n`);
	return {};
});

test(exec, '-v', async (program, t) => {
	const {stderr, stdout} = await program;
	t.is(stderr, '');
	t.is(stdout, `${pkg.version}\n`);
	return {};
});
