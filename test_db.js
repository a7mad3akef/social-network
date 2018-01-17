var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var databaseName = 'discogs'
var url = 'mongodb://' + 'adminrole' + ':' + 'susuSUSU1234!%40%23%24' + '@127.0.0.1:' + '27017' + '/' + databaseName;


MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var query = { title:'Östermalm' };
  dbo.collection("songs").find(query).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
});