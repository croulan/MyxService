var express = require("express");
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require('mongodb').ObjectID;
var bodyparse = require("body-parser");
var PythonShell = require("python-shell");
var app = express();

var db = null;

app.use(bodyparse.json());
app.use(express.static('public'));
app.use(express.static('node_modules'));

MongoClient.connect('mongodb://localhost:27017/mittens', function(err, dbconn) {
    if (!err) {
        console.log('Connection Successful');
        db = dbconn;
    }
});
 
app.put('/myxrecipe', function (req, res, next) {
    var sendRecipe = req.body.data;
    var options = {
        mode: 'text',
        pythonPath: '/usr/bin/python',
        pythonOptions: ['-u'],
        scriptPath: '../MotorControl',
        args: ''
    };

    options.args = req.body.data;
        
    PythonShell.run('my_script.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        console.log('Myx request sent with recipe: %j', results);
    });


    return res.send();
        
});

app.get('/homepage', function (req, res, next) {
    db.collection('meows', function(err, recipeCollection) {
        recipeCollection.find().toArray(function(err, recipes) {
            return res.json(recipes);

        });

    });
 
});

app.put('/homepage/remove', function(req,res,next) {

    db.collection('meows', function(err, recipeCollection){
        var recipeId = req.body.recipe._id;
        
        recipeCollection.remove({_id: ObjectId(recipeId)}, {w:1}, function(err, result) {
            return res.send();

        });
    });

});

app.post('/homepage', function (req, res, next) {
    
    db.collection('meows', function(err, recipeCollection) {
        var recipe = { contents: req.body };

        recipeCollection.insert(recipe, {w:1}, function(err) {
            return res.send();

        });

    });

});

app.listen(3000, function () {
    console.log("Listening on port 3000");
});
