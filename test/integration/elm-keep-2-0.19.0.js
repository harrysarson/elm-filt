import test from 'ava';
import {exec} from '../helpers/cli';

test(
	exec,
	'examples/elm-0.19.0.js --keep Example.add --keep Example.main',
	async (t, program) => {
		return {snapshot: await program};
	}
);
