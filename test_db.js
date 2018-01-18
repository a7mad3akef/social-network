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

function add_song_to_events(theId, callback){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var query = { _id: ObjectId(theId) };
    db.collection("songs").find(query).toArray(function(err, result) {
      if (err) throw err;
      delete result[0]._id
      result[0].user = "root"
      result[0].song_id = theId
      result[0].likes = []
      result[0].dislikes = []
      result[0].comments = []
      result[0].pushes = []
      db.collection("events").insertOne(result[0], function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
      callback(result)
    });
    
   
  });
}

add_song_to_events('5a16b3e1a5b94b1626140002',function(result){
    console.log(result)
})