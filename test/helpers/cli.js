import childProcess from 'child_process';
import util from 'util';

const elmFilt = './bin/elm-filt';
const execCmd = util.promisify(childProcess.exec);

export function runElmFilt(argString) {
	return execCmd(`node ${elmFilt} ${argString}`);
}

export async function exec(t, argString, func) {
	const {snapshot} = await func(runElmFilt(argString), t);

	if (snapshot !== undefined) {
		t.snapshot(`elm-filt ${argString}`, {id: `Invocation`});
		t.snapshot(snapshot.stderr, {id: `Stderr`});
		t.snapshot(snapshot.stdout, {id: `Stdout`});
	}
}

exec.title = (providedTitle, argString) =>
	`${
		providedTitle === undefined ? '' : `${providedTitle}:`
	} elm-filt ${argString}`.trim();
