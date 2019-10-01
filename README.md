# elm-filt

![elm-filt](https://raw.githubusercontent.com/harrysarson/elm-filt/master/assets/elm-filt.png)

> Filter the output of the elm compiler

[![Actions Status](https://github.com/harrysarson/elm-filt/workflows/Node%20CI/badge.svg)](https://github.com/harrysarson/elm-filt/actions)

## Install

  $ npm install --global elm-filt

## Usage

  $ elm-filt --help

    Filter the output of the elm compiler

    Usage
      $ elm-filt <source> --keep <elm specifier> [--keep <elm specifier>]...

    Elm Specifiers
      author/pkg:Module.name  Keep the elm function or variable called "name"
                                in module "Module" in package installed using
                                `elm install author/package`.
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

## Contributors

| [![Harry Sarson](https://github.com/harrysarson.png?size=130)](https://github.com/harrysarson)  |
| ----------------------------------------------------------------------------------------------- |
| Harry Sarson                                                                                    |

## License

[MIT](https://github.com/harrysarson/elm-filt/tree/master/assets/elm-filt.svg)

## Attribution

* The elm-filt logo is derived from the offical elm logo created by [Evan Czaplicki](https://github.com/evancz)
