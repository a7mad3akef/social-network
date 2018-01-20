var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var databaseName = 'discogs'
var url2 = 'mongodb://' + 'kofa' + ':' + 'kofa' + '@127.0.0.1:' + '27017' + '/' + databaseName;


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
    MongoClient.connect(url2, function(err, db) {
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
  MongoClient.connect(url2, function(err, db) {
    if (err) throw err;
    var query = { _id: ObjectId(theId) };
    db.collection("songs").find(query).toArray(function(err, result) {
      if (err) throw err;
      console.log(result)
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
function get_user_posts(theId, callback){
  MongoClient.connect(url2, function(err, db) {
    if (err) throw err;
    var query = { user_id: ObjectId(theId) };
    db.collection("events").find(query).toArray(function(err, result) {
      if (err) throw err;
      console.log(result)
      callback(result)
    }); 
  });
}

function get_post_info(theId, callback){
  MongoClient.connect(url2, function(err, db) {
    if (err) throw err;
    var query = { _id: ObjectId(theId) };
    db.collection("events").find(query).toArray(function(err, result) {
      if (err) throw err;
      console.log(result)
      callback(result)
    }); 
  });
}

// add_song_to_events('5a16b3e1a5b94b1626140002',function(result){
//     console.log(result)
// })

function add_like_to_post(theId, callback){
  MongoClient.connect(url2, function(err, db) {
    if (err) throw err;
    // var query = {$and: [{user_id : sender},{state:'not_confirmed'}]};
    var query = { _id: ObjectId(theId) };
    db.collection("events").find(query).toArray(function(err, result) {
      if (err) throw err;
      console.log(result[0].likes);
      db.close();
      current_likes = result[0].likes
      current_likes.push({name:'Ahmed Akef'})
      MongoClient.connect(url2, function(err, db) {
          if (err) throw err;
          var myquery = { _id: ObjectId(theId) };
          var newvalues = { $set: { likes: current_likes } };
          db.collection("orders").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
            console.log(res)
          });
        });
    });
  });
}

add_like_to_post('5a616998b0ad35327e49414b', function(result){
  console.log(result)
})