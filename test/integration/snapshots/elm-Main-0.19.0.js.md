# Snapshot report for `test/integration/elm-Main-0.19.0.js`

The actual snapshot is saved in `elm-Main-0.19.0.js.snap`.

Generated by [AVA](https://ava.li).

## stderr

    ''

## stdout

    `␊
    // For Main.main␊
    var author$project$Main$main = elm$browser$Browser$document(␊
    	{␊
    		init: function (_n0) {␊
    			return author$project$State$initialState;␊
    		},␊
    		subscriptions: author$project$Subscriptions$subscriptions,␊
    		update: author$project$State$update,␊
    		view: function (model) {␊
    			return {␊
    				body: _List_fromArray(␊
    					[␊
    						author$project$View$view(model)␊
    					]),␊
    				title: 'Prime Image'␊
    			};␊
    		}␊
    	});␊
    `
