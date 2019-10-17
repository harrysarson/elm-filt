/* eslint-disable ava/no-ignored-test-files */

import childProcess from 'child_process';
import util from 'util';
import test from 'ava';

const elmFilt = './bin/elm-filt';

const exec = util.promisify(childProcess.exec);

export function execTest(argString, func) {
	test(`elm-filt ${argString}`, t => {
        function processSnapshot({stderr, stdout}) {
            t.snapshot(`elm-filt ${argString}`, {id: `Invocation`});
            t.snapshot(stderr, {id: `Stderr`});
            t.snapshot(stdout, {id: `Stdout`});
        }

        return func(t, exec(`node ${elmFilt} ${argString}`), processSnapshot)
    });
}


// export function exec(t, argString, runProcess) {
//     return runProcess(t, exec(`node ${elmFilt} ${argString}`));
// }

// exec.title = (providedTitle = '', argString) => `${providedTitle} elm-filt ${argString}`.trim();

// export function execSnapshot(t, argString, runProcess) {
//     const { stdout, stdin } = runProcess(t, exec(`node ${elmFilt} ${argString}`));
// 	t.snapshot(stderr, {id: `stderr`});
//     t.snapshot(stdout, {id: `stdout`});
// }

// execTest.title = (providedTitle = '', argString) => `${providedTitle} elm-filt ${argString}`.trim();
