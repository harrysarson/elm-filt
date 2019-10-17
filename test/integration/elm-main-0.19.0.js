import {execTest, processSnapshot} from '../helpers/cli';

execTest('examples/elm-Main-0.19.0.js --keep Main.main', async (t, program) => {
	processSnapshot(t, await program);
});
