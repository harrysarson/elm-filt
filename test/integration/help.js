import {execTest} from '../helpers/cli';

execTest('--help', async (t, program, processSnapshot) => {
	processSnapshot(await program);
});
