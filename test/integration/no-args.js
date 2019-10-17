import {execTest} from '../helpers/cli';

execTest('', async (t, program, processSnapshot) => {
	processSnapshot(await t.throwsAsync(program));
});
