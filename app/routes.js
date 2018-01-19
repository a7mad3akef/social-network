var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = "mongodb://name:password@ds113586.mlab.com:13586/oauth-rix";
var async = require("async");
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
const uploadDir = path.join(__dirname, '/uploads/')

module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        var user            = req.user;
        if (user.name ) {
            res.render('profile.ejs', {
                user : user
            });
        } else {
            if (user.local.name){
                user.name    = user.local.name;
                user.email   = user.local.email;
                user.save(function(err) {
                    res.redirect('/profile');
                });
            } else if (user.facebook.name) {
                user.name    = user.facebook.name;
                user.email   = user.facebook.email;
                user.save(function(err) {
                    res.redirect('/profile');
                });
            } else if (user.google.name) {
                user.name    = user.google.name;
                user.email   = user.google.email;
                user.save(function(err) {
                    res.redirect('/profile');
                });
            }
        }
        
        
        
        
        
    });

    // TEST SECTION ===========================
    app.get('/test', isLoggedIn, function(req, res) {
        res.send({
            user : req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile', 'email'] }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : ['public_profile', 'email'] }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // update users (following)
    app.get('/users', isLoggedIn, function(req, res) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
              var query = {}
              db.collection("users").find(query).toArray(function(err, result) {
                  if (err) throw err;
                //   console.log(result)
                  db.close();
                //   console.log(result)
               
                var following = req.user.following;  

                
  
                for (var i in result) {
                    
                    // console.log(result[i]._id, i);
                    // console.log(req.user._id )
                    if ( JSON.stringify(result[i]._id) == JSON.stringify(req.user._id ) ) {
                        console.log('frgtrr',i)
                        result.splice(i, 1); 
                    }
                       
                }
                
                // var notFollowing = [];

                // async.each(result,
                //     // 2nd param is the function that each item is passed to
                //     function(item, index, callback){
                //         // console.log(index)
                //         async.each(following,
                //             // 2nd param is the function that each item is passed to
                //             function(follow, callback){
                             
                //                 if ( JSON.stringify(follow.id) != JSON.stringify(item._id) ) {
                //                     notFollowing.push(item); 
                //                 }
                //             },
                //             function(err){
                //               console.log(err)
                //             }
                //           );
                        
                //     },
                //     function(err){
                //       console.log(err)
                //     }
                //   );

                   
                      
                    // for (var v in following) { 
                    //     if ( JSON.stringify(following[v].id) == JSON.stringify(result[i]._id) ) {
                    //         result.splice(i, 1); 
                    //     }
                    // } 
                   

                //   console.log('here')
                //   result.push(req.user)
                //   res.send(result)


                // function comparer(otherArray){
                //     return function(current){
                //       return otherArray.filter(function(other){
                //         return other.value == current.value 
                //       }).length == 0;
                //     }
                //   }
                  
                //   var onlyInA = result.filter(comparer(following));
                //   var onlyInB = following.filter(comparer(result));
                  
                //   final = onlyInA.concat(onlyInB);
                  
                //   console.log(final);


                res.render('users.ejs', {
                    result : result,
                    following : following
                });
              });    
        });
        // res.send({
        //     user : req.user
        // });
    });
    // unfollow user
    app.get('/unfollow', isLoggedIn, function(req, res) {
        var following_id = req.query.id
        var following_name = req.query.name
        var follower_id = req.user._id
        var follower_name = req.user.name
        var user           = req.user;
        var following      = user.following;
        for (var i in following ) {

            if ( JSON.stringify(following[i].id) == JSON.stringify(req.query.id ) ) {
                following.splice(i, 1); 
            }
        }

        user.following = following;
        user.save(function(err) {
            
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var query = { _id: ObjectId(following_id) };
                db.collection("users").find(query).toArray(function(err, result) {
                  if (err) throw err;
                  followers = result[0].followers;
                  for (var i in followers ) {
                    
                                if ( JSON.stringify(followers[i].id) == JSON.stringify(follower_id ) ) {
                                    followers.splice(i, 1); 
                                }
                            }
                  console.log(followers);
                  
                  db.close();
                  MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    newvalues = {
                        $set:{followers : followers}
                    }
                    db.collection("users").updateOne(query, newvalues, function(err, res) {
                      if (err) throw err;
                      console.log("1 document updated");
                      db.close();
                    });
                  });
                });
                
            });

            res.redirect('/users');
        });
        
    });
    // follow user
    app.get('/follow', isLoggedIn, function(req, res) {
        var following_id = req.query.id
        var following_name = req.query.name
        var follower_id = req.user._id
        var follower_name = req.user.name
        // console.log(follower_id, follower_name)
        var user = req.user;
        var following = {
            id: following_id,
            name: following_name
        }
        var follower = {
            id : follower_id,
            name : follower_name
        }
        user.following.push(following);
        user.save(function(err) {
            
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var query = { _id: ObjectId(following_id) };
                db.collection("users").find(query).toArray(function(err, result) {
                  if (err) throw err;
                  followers = result[0].followers;
                  followers.push(follower)
                  console.log(followers);
                  
                  db.close();
                  MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    newvalues = {
                        $set:{followers : followers}
                    }
                    db.collection("users").updateOne(query, newvalues, function(err, res) {
                      if (err) throw err;
                      console.log("1 document updated");
                      db.close();
                    });
                  });
                });
                
            });

            res.redirect('/users');
        });
        
        
    });
    // follow user
    app.get('/settings', isLoggedIn, function(req, res) {
        var user = req.user;
        var profile_picture = user.profile_picture
        console.log(profile_picture)
        res.render('settings.ejs', {
            user : user,
            profile_picture: profile_picture
        });
    });
    // follow user
    app.get('/following', isLoggedIn, function(req, res) {
        var following = req.user.following;
        res.render('following.ejs', {
            following : following
        });
    });
    // follow user
    app.get('/followers', isLoggedIn, function(req, res) {
        var followers = req.user.followers;
        res.render('followers.ejs', {
            followers : followers
        });
    });
    // get user info
    app.get('/user', isLoggedIn, function(req, res) {
        
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var query = { _id: ObjectId(req.query.id) };
            db.collection("users").find(query).toArray(function(err, result) {
              if (err) throw err;
              console.log(result);
              db.close();
              var followers = result[0].followers  
              for (var i in followers ) {
        
                    if ( JSON.stringify(followers[i].id) == JSON.stringify(req.user._id ) ) {
                        res.render('user.ejs',{
                            user : result,
                            unfollow: 1
                            });
                    }
                }  

              res.render('user.ejs',{
                user : result,
                unfollow: 0
                });  
            });
            
        });

        

        
    });

    app.post('/image_upload', isLoggedIn, function(req, res){
        
        var form = new formidable.IncomingForm();
        form.multiples = true
        form.keepExtensions = true
        form.uploadDir = uploadDir
        form.parse(req, (err, fields, files) => {
          if (err) return res.status(500).json({ error: err })
        //   res.redirect('/settings');
        })
        form.on('fileBegin', function (name, file) {
          var [fileName, fileExt] = file.name.split('.')
          var file_path = path.join(uploadDir, `${fileName}_${new Date().getTime()}.${fileExt}`)
          file.path = file_path
          var relative_path = file_path.split(uploadDir)[1]
          console.log(relative_path)

          MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var query = { _id: ObjectId(req.user.id) };
            db.collection("users").find(query).toArray(function(err, result) {
              if (err) throw err;
              console.log(result);
              var user = result[0]
              user.profile_picture = relative_path
              db.close();
              MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var myquery = { _id: ObjectId(req.user.id) };
                var newvalues = user
                db.collection("users").updateOne(myquery, newvalues, function(err, result) {
                  if (err) throw err;
                  console.log("1 document updated");
                  db.close();
                //   console.log(result)
                  
                });
                res.redirect('/settings'); 
                // console.log(user)
                // res.render('settings.ejs',{
                //     user : user
                //     }); 
              });

              
            });
            
        });

        })
    })

    app.post('/listen_song', isLoggedIn, function(req, res){
        var user = req.user
        var theId = req.body.theId
        console.log(theId)
        add_song_to_events(theId, user, function(){
            res.redirect('acount');
        })
    })

    app.get('/account', isLoggedIn, function(req, res){
        var user = req.user;
        res.render('account.ejs',{
            user : user
        })
    })

};

function add_song_to_events(theId, user, callback){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var query = { _id: ObjectId(theId) };
      db.collection("songs").find(query).toArray(function(err, result) {
        if (err) throw err;
        console.log(result)
        delete result[0]._id
        result[0].user_name = user.name
        result[0].user_id = user._id
        result[0].song_id = theId
        result[0].time = getDateTime()
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

  function getDateTime() {
    
        var date = new Date();
    
        var hour = date.getHours();
        hour = (hour < 10 ? "0" : "") + hour;
    
        var min  = date.getMinutes();
        min = (min < 10 ? "0" : "") + min;
    
        var sec  = date.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;
    
        var year = date.getFullYear();
    
        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;
    
        var day  = date.getDate();
        day = (day < 10 ? "0" : "") + day;
    
        return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
    
    }
// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
