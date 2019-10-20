import test from 'ava';
import {exec} from '../helpers/cli';

test(exec, '--help', async (t, program) => {
	return {snapshot: await program};
});
