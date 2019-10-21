import test from 'ava';
import {exec} from '../helpers/cli';

test(exec, '', async (program, t) => {
	const output = await t.throwsAsync(program);
	t.is(output.code, 2);
	return {snapshot: output};
});
