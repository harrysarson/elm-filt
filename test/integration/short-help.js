import {execTest} from '../helpers/cli';

execTest("-h", async (t, program) => {
    const {stderr, stdout} = await program;

    t.snapshot(stderr, { id: `stderr`});
    t.snapshot(stdout, { id: `stdout`});
});
