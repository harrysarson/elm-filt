import {execTest} from '../helpers/cli';

execTest("examples/elm-0.19.0", async (t, program) => {
    const {stderr, stdout, code} = await t.throwsAsync(program);

    t.is(code, 2);
    t.snapshot(stderr, { id: `stderr`});
    t.snapshot(stdout, { id: `stdout`});
});
