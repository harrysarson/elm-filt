import test from 'ava';
import {exec} from '../helpers/cli';

test(exec, 'examples/elm-0.19.0.js --keep Example.add', async program => ({
	snapshot: await program
}));
