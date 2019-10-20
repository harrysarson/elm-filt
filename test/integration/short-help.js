import test from 'ava';
import {exec} from '../helpers/cli';

test(exec, '-h', async (t, program) => {
	return {snapshot: await program};
});
