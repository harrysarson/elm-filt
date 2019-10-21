import test from 'ava';
import {exec} from '../helpers/cli';

test(exec, '-h', async program => {
	return {snapshot: await program};
});
