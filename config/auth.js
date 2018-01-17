// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'        : '379060449188375', // your App ID
        'clientSecret'    : '2b5f8fb67513fce202cb868631e89865', // your App Secret
        'callbackURL'     : 'https://kofa.localtunnel.me/auth/facebook/callback',
        'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields'   : ['id', 'email', 'name'] // For requesting permissions from Facebook API

    },

    'twitterAuth' : {
        'consumerKey'        : 'your-consumer-key-here',
        'consumerSecret'     : 'your-client-secret-here',
        'callbackURL'        : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'         : '793005397109-72n125b0t8fp5as6at64fbragr6ogk1f.apps.googleusercontent.com',
        'clientSecret'     : 'XFcCgiWLHvuNsmLIzBALLFe2',
        'callbackURL'      : 'http://localhost:8080/auth/google/callback'
    }

};
