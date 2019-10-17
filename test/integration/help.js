import {execTest, processSnapshot} from '../helpers/cli';

execTest('--help', async (t, program) => {
	processSnapshot(t, await program);
});
