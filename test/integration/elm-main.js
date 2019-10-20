import {execTest} from '../helpers/cli';

execTest(
	'examples/elm-Main.js --keep Main.main',
	async (t, program, processSnapshot) => {
		processSnapshot(await program);
	}
);
