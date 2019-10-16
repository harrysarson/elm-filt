
import childProcess from 'child_process';
import test from 'ava';
import util from 'util';

const elmFilt = './bin/elm-filt';

const exec = util.promisify(childProcess.exec);

export function execTest(argString, func) {
    test(`elm-filt ${argString}`, t => func(t, exec(`node ${elmFilt} ${argString}`)));
}
