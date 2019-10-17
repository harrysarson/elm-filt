import {execTest} from '../helpers/cli';

execTest('examples/elm-0.19.0.js --keep Example.add', async (t, program, processSnapshot) => {
    t.log('hi1');
    let r = await program;
	processSnapshot(r);
    t.log('hi2');
});

