import {execTest} from '../helpers/cli';

execTest('', async (t, program) => {
	const {stderr, stdout, code} = await t.throwsAsync(program);

	t.is(code, 2);
	t.snapshot(stderr, {id: `stderr`});
	t.snapshot(stdout, {id: `stdout`});
});
