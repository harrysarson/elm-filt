/* eslint-disable ava/no-ignored-test-files */

import childProcess from 'child_process';
import util from 'util';
import test from 'ava';

const elmFilt = './bin/elm-filt';

const exec = util.promisify(childProcess.exec);

export function execTest(argString, func) {
	test(`elm-filt ${argString}`, t => {
		func(t, exec(`node ${elmFilt} ${argString}`));
	});
}
