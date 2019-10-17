import {execTest} from '../helpers/cli';

execTest('examples/elm-0.19.0', async (t, program, processSnapshot) => {
	processSnapshot(await t.throwsAsync(program));
});
