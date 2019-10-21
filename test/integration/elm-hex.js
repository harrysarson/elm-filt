import test from 'ava';
import {exec} from '../helpers/cli';

test(
	exec,
	'examples/elm-hex.js --keep rtfeldman/elm-hex:Hex.fromString',
	async program => {
		return {snapshot: await program};
	}
);
