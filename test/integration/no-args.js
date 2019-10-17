import {execTest, processSnapshot} from '../helpers/cli';

execTest('', async (t, program) => {
	processSnapshot(t, await t.throwsAsync(program));
});
