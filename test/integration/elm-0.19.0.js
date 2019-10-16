import {execTest} from '../helpers/cli';

execTest("examples/elm-0.19.0.js --keep Example.add", async (t, program) => {
    const {stderr, stdout} = await program;

    t.snapshot(stderr, { id: `stderr`});
    t.snapshot(stdout, { id: `stdout`});
});
