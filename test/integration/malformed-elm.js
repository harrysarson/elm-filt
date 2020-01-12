import test from 'ava';
import {exec} from '../helpers/cli';

test(exec, 'examples/malformed-elm.js --keep Main.main', async (program, t) => {
	const output = await t.throwsAsync(program);
	t.is(output.code, 2);
	return {snapshot: output};
});
