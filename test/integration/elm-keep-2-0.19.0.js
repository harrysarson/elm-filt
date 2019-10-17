import {execTest} from '../helpers/cli';

execTest(
	'examples/elm-0.19.0.js --keep Example.add --keep Example.main',
	async (t, program, processSnapshot) => {
		processSnapshot(await program);
	}
);
