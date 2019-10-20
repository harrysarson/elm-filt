import test from 'ava';
import {exec} from '../helpers/cli';

test(exec, 'examples/elm-0.19.0', async (t, program) => {
	return {snapshot: await t.throwsAsync(program)};
});
