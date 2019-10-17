import {execTest, processSnapshot} from '../helpers/cli';

execTest('examples/elm-0.19.0.js --keep Example.add', async (t, program) => {
	processSnapshot(t, await program);
});
