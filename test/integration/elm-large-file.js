import {execTest} from '../helpers/cli';

execTest(
	'examples/elm-large-file.js --keep Main.main',
	async (t, program, processSnapshot) => {
		processSnapshot(await program);
	}
);
