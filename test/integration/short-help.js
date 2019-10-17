import {execTest} from '../helpers/cli';

execTest('-h', async (t, program, processSnapshot) => {
	processSnapshot(await program);
});
