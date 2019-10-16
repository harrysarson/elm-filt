import {execTest} from '../helpers/cli';

execTest('examples/elm-Main-0.19.0.js --keep Main.main', async (t, program) => {
	const {stderr, stdout} = await program;

	t.snapshot(stderr, {id: `stderr`});
	t.snapshot(stdout, {id: `stdout`});
});
