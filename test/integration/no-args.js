import test from 'ava';
import {exec} from '../helpers/cli';

test(exec, '', async (t, program) => {
	return {snapshot: await t.throwsAsync(program)};
});
