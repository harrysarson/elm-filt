import test from 'ava';
import {exec} from '../helpers/cli';

test(exec, '--help', async program => {
	return {snapshot: await program};
});
