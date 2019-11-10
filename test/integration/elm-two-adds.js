import test from 'ava';
import {exec, runElmFilt} from '../helpers/cli';

test(
	exec,
	'examples/elm-two-adds.js --keep Main.addBuiltin --keep Main.addKernel',
	async program => {
		return {snapshot: await program};
	}
);

test('Keeps are in document order', async t => {
	const orderA = await runElmFilt(
		'examples/elm-two-adds.js --keep Main.addBuiltin --keep Main.addKernel'
	);
	const orderB = await runElmFilt(
		'examples/elm-two-adds.js  --keep Main.addKernel --keep Main.addBuiltin'
	);

	t.deepEqual(orderA, orderB);
});
