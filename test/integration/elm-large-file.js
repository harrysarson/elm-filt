import test from 'ava';
import {exec} from '../helpers/cli';

test(exec, 'examples/elm-large-file.js --keep Main.main', async program => {
	return {snapshot: await program};
});
