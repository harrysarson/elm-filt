# Snapshot report for `test/integration/malformed-elm.js`

The actual snapshot is saved in `malformed-elm.js.snap`.

Generated by [AVA](https://ava.li).

## Invocation

    'elm-filt examples/malformed-elm.js --keep Main.main'

## Stderr

    `× The following start of the elm file is not valid:␊
    const scope = {};␊
    (function(scope){␊
    'use strict';␊
    function F(arity, fun, wrapper) {␊
      wrapper.a = arity;␊
      wrapper.f = fun;␊
      return wrapper;␊
    }␊
    function F2(fun) {␊
      return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })␊
    ...␊
    `

## Stdout

    ''