import test from 'ava';
import {exec} from '../helpers/cli';

test(
	exec,
	'examples/elm-0.19.1.js --keep elm/core:Elm.Kernel.Platform.initialize',
	async program => ({
		snapshot: await program
	})
);
