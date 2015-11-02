var express = require('express');
var helper = require('../helper.js');
var cb = require('../cb.js');

var router = express.Router();
var bucket = cb.bucket();

/**
 * Relevant constants for the text tokenizing
 */
var SPACES = ['\u0009', '\u000a', '\u000b', '\u000c', '\u000d', '\u0020', '\u00a0', '\u1680', '\u180e', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\    u2009', '\u200a', '\u2028', '\u2029', '\u202f', '\u205f', '\u3000'];
var NEWLINES = ['\u000a', '\u000d', '\u2028', '\u2029'];
var IGNORE = ["!", "\"", '§', '$', '%', '&', '/', '(', ')', '=', '?', '`', '*', '+', '\'', '#', ',' ,';', ':', '.', '-', '_', '<', '>', '¡', '“', '¶', '¢', '[', ']','|','{','}','≠','¿', '≠'];

//Gloabal counter
var count = -1;

/**
 * Service method
 */
router.get('/fts', function (req, res) {
	
	res.send('This is the Full Text Search service.');

});


/**
 * Index based on the text
 */
router.post('/fts/indexit', function (req, res) {

   //Reset the global counter
   count = 0;

   var id = req.query.id;	
   var field = req.query.field;
   var text = req.query.text;   


   if ( helper.isDefined(text) && helper.isDefined(id) ) {

	  if (!helper.isDefined(field)) field = "_all";

	   console.log("id = " + id);
	   console.log("field = " + field);
	   console.log("text = " + text);

	   var tokenized = tokenize(text);

	   console.log("tokenized = " + JSON.stringify(tokenized));

	   //For each token
	   for ( i=0; i < tokenized.length; i++ ) {
                   
		   var token = tokenized[i];
		   var key = "fts::" + field + "::" + token;

		   console.log("key = " + key);
           
           //Process params in the context of the function
           addOrExtend(key, id, res, tokenized.length);
	   }	   
   }
   else {

	   res.status(500).json({ "success" : false , "error" : "Did you pass all mandatory parameters?", "params" : ["!id", "!text", "field"] });
   }

});


/**
 * Add or extend an entry
 */
function addOrExtend(key, id, res, expectedSize) {

		   var doc = {};
		   doc.refs = [ id ];
		   doc.count = 1;

		   bucket.insert( key, doc, function( errIns, cbResIns ) {


			   if (errIns) {

				   console.log("Could not insert, so trying to extend the entry  ...");

				   bucket.get(key, function(errGet, cbresGet) {

					   if (errGet) {
						   
						   res.status(500).json({ "success" : false, "error" : errGet });
					   }
					   else {

						    var doc = cbresGet.value;
						    
						    console.log("doc = " + JSON.stringify(doc));

						    if (!arrContains(doc.refs, id)) {

							    doc.refs.push(id);
							    doc.count = doc.refs.length;

							    bucket.replace( key, doc, function(errRep, cbresRep) {

								    if (errRep) {

									    res.status(500).json({ "success" : false, "error" : errRe });
								    }
								    else {
									    console.log("Extended existing entry.");
									    //Increase the global counter in order to know when the result should be printed
                                        count++;
									    if (count == expectedSize ) res.json({ "success" : true, "count" : count});

								    }
							    });
						    }
						    else {
							    console.log("Skipped existing entry.");
							    count++;
							    if ( count == expectedSize ) res.json({ "success" : true, "count" : count});
						    }
					   }
				   });

			   }
			   else {
				   console.log("Inserted a new entry.");
				   count++;
				   if (count == expectedSize ) res.json({ "success" : true, "count" : count});
			   }

		   });
}


/**
 * Search for some words
 */
router.get('/fts/search', function (req, res) {
	
	var words = req.query.words;
	var field = req.query.field;

	if (helper.isDefined(words)) {

		if (!helper.isDefined(field)) field = "_all";

		var tokens = tokenize(words);

		var keys = [];

		for ( i=0; i < tokens.length; i++ ) {

			var token = tokens[i];
			var key = "fts::" + field + "::" + token;
			keys.push(key);
		}


		bucket.getMulti(keys, function(err, cbres) {

			if (err !== keys.length) { 
			    
				var result = {};
                result.success = true;
                result.skipped = err;
                result.refs = {};

				for (var key in cbres) {
					
					var r = cbres[key];
                    
                    if (r.value) {
                    
					   var refs = r.value.refs;

					   for ( i=0; i < refs.length; i++ ) {

						  var ref = refs[i];
						  var old = result.refs[ref];

						  if (helper.isDefined(old)) {

				                result.refs[ref] = old + 1;

						  }
						  else {
                              
                              result.refs[ref] = 1;
						  }	
					   }
				    }
                }
                
				res.json(result);
			}
			else {
                
				res.json({"success" : false, "skipped" : err });
			}
		});

	}
	else {

		res.status(500).json({ "success" : false, "error" : "Did you pass all mandatory parameters?", "params" : ["!words", "field"] });
	}
});



/**
 * Tokenize
 */
function tokenize(text) {

    var result = []
    
    //Decode the uri component in order to make sure that we have a unicode string
    try {
    
        var decoded = decodeURIComponent(text);

        //Identify tokens
        var tokenized = decoded;

        for (i = 0; i < IGNORE.length; i++) {

          var ignore = IGNORE[i];
          tokenized = tokenized.replace(new RegExp(escapeRegExp(ignore),'g'), " ");
        }


        for (i = 0; i < SPACES.length; i++) {

           var sp = SPACES[i];
           tokenized = tokenized.replace(new RegExp(escapeRegExp(sp),'g'), "#");
        }

        for (i = 0; i < NEWLINES.length; i++) {

            var nl = NEWLINES[i];
            tokenized = tokenized.replace(new RegExp(escapeRegExp(nl),'g'), "#");
        }

        var tmp = tokenized.split('#');

        for (i = 0; i < tmp.length; i++) {

            if ( tmp[i] != "" ) {

                result.push(tmp[i]);
            }
        }

    }
    catch (err) {
        
        //decodeURIComponent can cause an exception
        console.log(err);     
    }
        
    return result;
}

/**
 * Escape a regexp
 */
function escapeRegExp(string) {
	    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

/**
 * Array contains
 */
function arrContains(a, obj) {
	
	var i = a.length;
	
	while (i--) {
		if (a[i] === obj) {
			return true;
		}
	}
	
	return false;
}

//TODO: Add default error handler
module.exports = router;
