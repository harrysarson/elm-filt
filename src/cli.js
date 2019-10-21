import meow from 'meow';
import log from 'log';
import logNode from 'log-node';

import fs from 'fs-extra';
import {detectElmVersion, filter, ElmFiltError} from './lib';

export const helpText = `  Usage
    $ elm-filt <source> --keep <elm specifier> [--keep <elm specifier>]...

  Elm Specifiers
    author/pkg:Module.name  Keep the elm function or variable called "name"
                              in module "Module" in package installed using
                              \`elm install author/package\`.
    Module.name             Same as above for elm functions or variables
                              defined within your project.

  Options
    --keep, -k              Elm functions to include in JavaScript output
    --version, -v           Print version and quit
    --help, -h              Display this information and quit

  Examples
    $ elm-filt elm.js --keep Main.main --keep Main.update

      // For Main.main
      var author$project$Main$main = elm$browser$Browser$document(
        {
          init: function (_n0) {
            return author$project$State$initialState;
          },
          subscriptions: author$project$Main$subscriptions,
          update: author$project$State$update,
          view: author$project$Main$view
        });

      // For State.update
      var author$project$State$update = F2(
        function (msg, model) {
          switch (msg.$) {
            case 'Noop':
              return GlobalWebIndex$cmd_extra$Cmd$Extra$pure(model);
            case 'ChangeStage':
              ...
`;

export async function main() {
	logNode();
	try {
		const cli = meow(helpText, {
			flags: {
				keep: {
					type: 'string',
					alias: 'k'
				},
				version: {
					type: 'bool',
					alias: 'v'
				},
				help: {
					type: 'bool',
					alias: 'h'
				}
			}
		});

		if (cli.flags.version) {
			cli.showVersion();
		}

		if (cli.flags.help) {
			cli.showHelp(0);
		}

		if (cli.input.length === 0 && Object.keys(cli.flags).length === 0) {
			cli.showHelp(2);
		}

		if (cli.input.length !== 1) {
			throw new ElmFiltError(`${
				cli.input.length
			} paths to JavaScript files generated by elm have be provided.
  Exactly 1 path must be provided. ${
		cli.input === []
			? ''
			: `Provided paths: ${['', ...cli.input].join('\n  - ')}`
	}`);
		}

		if (cli.flags.keep === undefined) {
			throw new ElmFiltError(
				'One or more fully qualified elm function names must be provided.'
			);
		}

		const keep = (x => (typeof x === 'string' ? [x] : x))(cli.flags.keep);
		const input = cli.input[0];

		const source = await (async () => {
			try {
				return await fs.readFile(input, 'utf8');
			} catch (error) {
				throw new ElmFiltError(
					`The path ${input} could not be read! Details:\n${error}`
				);
			}
		})();

		const version = (() => {
			try {
				return detectElmVersion(source);
			} catch (error) {
				if (error.supportedElmVersions === undefined) {
					throw new ElmFiltError(
						`Unkown error when attempting to recognise ${input}! Details:\n${error}`
					);
				} else {
					throw new ElmFiltError(`The JavaScript file at ${input} does not contain the output of a supported elm compiler.
The following elm compiler versions are supported:${[
						'',
						...error.supportedElmVersions
					].join('\n  - ')}`);
				}
			}
		})();

		const filtered = filter({
			source,
			keeps: keep,
			assumeVersion: version
		});

		process.stdout.write(`/* elm-filt ${cli.pkg.version}
 * File:        ${input}.
 * Type:        JavaScript
 * Compiler:    Offical elm compiler <https://github.com/elm/compiler>
 * Version:     ${version}
 *
 * The following elm specifiers have been kept:
 *
${keep.map(k => ` * * \`${k}\``).join('\n')}
 */

`);

		for (const {elmIdentifier, javascript} of filtered) {
			process.stdout.write(`
// For ${elmIdentifier}
${javascript}
`);
		}
	} catch (error) {
		if (error.elmFiltError === true) {
			log.error(error.message);
			return 2;
		}

		log.error(error);
		return 3;
	}

	return 0;
}
