var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var databaseName = 'discogs'
var url = 'mongodb://' + 'akef' + ':' + 'akef1234' + '@127.0.0.1:' + '27017' + '/' + databaseName;


// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var query = { title:'Östermalm' };
//   db.collection("songs").find(query).toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// });

function get_song_by_id (theId, callback){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var query = { _id: ObjectId(theId) };
        db.collection("songs").find(query).toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          db.close();
          callback(result)
        });
      });  
}

get_song_by_id('5a16b3e1a5b94b1626140002',function(result){
    console.log(result)
})