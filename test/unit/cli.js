import test from 'ava';
import {helpText} from '../../src/cli';

test('help: no tabs', t => {
	t.assert(!helpText.includes('\t'));
});
