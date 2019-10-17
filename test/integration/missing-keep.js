import {execTest, processSnapshot} from '../helpers/cli';

execTest('examples/elm-0.19.0', async (t, program) => {
	processSnapshot(t, await t.throwsAsync(program));
});
