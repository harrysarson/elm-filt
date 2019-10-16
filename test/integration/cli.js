import pkg from '../../package.json';
import {execTest} from '../helpers/cli';

execTest('--version', async (t, program) => {
	const {stderr, stdout} = await program;
	t.is(stderr, '');
	t.is(stdout, `${pkg.version}\n`);
});

execTest('-v', async (t, program) => {
	const {stderr, stdout} = await program;
	t.is(stderr, '');
	t.is(stdout, `${pkg.version}\n`);
});
