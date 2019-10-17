import {execTest, processSnapshot} from '../helpers/cli';

execTest('-h', async (t, program) => {
	processSnapshot(t, await program);
});
