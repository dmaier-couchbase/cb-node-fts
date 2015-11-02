var express = require('express');
var router = express.Router();

var helper = require('../helper.js');
var cb = require('../cb.js');

var bucket = cb.bucket();


/**
 * Add a document
 */
router.post('/add', function (req, res) {
	
    var id = req.query.id;
    var msg = req.query.msg;
            
    if (helper.isDefined(id) && helper.isDefined(msg))
    {
        var key = "msg::" + id;
        var doc  = { 'msg' : msg };

        bucket.insert( key, doc, function(err, cbres) {
         
            if (err)
            {
                res.status(500).json({ "error" : "Could not add the document!" });   
            }
            else
            {
                console.log("Added " + key + " to Couchbase");
                res.json({ 'success' : true });
            }
        });      
    }
    else
    {
        res.status(500).json({"error" : 'Did you pass all mandatory parameters? ["id", "msg"]'});
    }    
});


/**
 * Get a document
 */
router.get('/get', function (req, res) {
	
    var id = req.query.id;
    
    if (helper.isDefined(id))
    {
        var key = "msg::" + id;

        bucket.get(key, function(err, cbres) {
          
            if (err)
            { 
                res.status(500).json({ "error" : "Could not get the document!" });                
            }
            else
            {
                res.json(cbres);
            }
            
        }); 
    }
    else
    {
        res.status(500).json({"error" : 'Did you pass all mandatory parameters? ["id"]'});
    }    
});

module.exports = router;
