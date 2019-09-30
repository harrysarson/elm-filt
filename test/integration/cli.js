import util from 'util';
import path from 'path';
import childProcess from 'child_process';
import fs from 'fs-extra';
import test from 'ava';

const elmFilt = './bin/elm-filt'

const exec = util.promisify(childProcess.exec);

const tests = fs.readdirSync(__dirname, 'utf8').filter(file => file.endsWith('.json')).map(file => file.slice(0, -5));

const objectPromiseAll = async obj =>
    Object.fromEntries(await Promise.all(Object.entries(obj).map(async ([key, value]) => [key, await value])));

const readFileOrEmpty = async (path) => {
    try {
        return await fs.readFile(path, 'utf8');
    } catch (e) {
        if (e.code === 'ENOENT') {
            return '';
        } else {
            throw e;
        }
    }

}

for (const testName of tests) {
    const testPath = path.join(__dirname, testName);
    const json = JSON.parse(fs.readFileSync(`${testPath}.json`));
    const cliInvokation = `${elmFilt} ${json.args}`;
    test(cliInvokation, async t => {
        const program = exec(cliInvokation);
        const {stderr, stdout, code = 0} = await (json.code !== 0
            ? t.throwsAsync(program)
            : program);
        t.deepEqual(code, json.code);
        const expected = await objectPromiseAll({
            stderr: await readFileOrEmpty(`${testPath}.stderr`),
            stdout: await readFileOrEmpty(`${testPath}.stdout`),
        });
        t.deepEqual(stderr, expected.stderr);
        t.deepEqual(stdout, expected.stdout);
    });
}
