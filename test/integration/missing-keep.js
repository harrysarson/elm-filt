import test from 'ava';
import {exec} from '../helpers/cli';

test(exec, 'examples/elm-0.19.0', async (program, t) => {
	const output = await t.throwsAsync(program);
	t.is(output.code, 2);
	return {snapshot: output};
});
