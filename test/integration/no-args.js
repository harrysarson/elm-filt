import test from 'ava';
import {exec} from '../helpers/cli';

test(exec, '', async (t, program) => {
	const output = await t.throwsAsync(program);
	t.is(output.code, 2);
	return {snapshot: output};
});
