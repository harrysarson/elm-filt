import childProcess from 'child_process';
import util from 'util';

const elmFilt = './bin/elm-filt';
const execCmd = util.promisify(childProcess.exec);

export async function exec(t, argString, func) {
	const {snapshot} = await func(t, execCmd(`node ${elmFilt} ${argString}`));

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
