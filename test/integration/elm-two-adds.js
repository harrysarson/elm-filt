import test from 'ava';
import {exec} from '../helpers/cli';

test(
	exec,
	'examples/elm-two-adds.js --keep Main.addBuiltin --keep Main.addKernel',
	async program => {
		return {snapshot: await program};
	}
);
