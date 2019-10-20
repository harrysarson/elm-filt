import {execTest} from '../helpers/cli';

execTest(
	'examples/elm-hex.js --keep rtfeldman/elm-hex:Hex.fromString',
	async (t, program, processSnapshot) => {
		processSnapshot(await program);
	}
);
