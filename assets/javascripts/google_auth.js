//   NOTE: Right now, every time you log in, it will ask you for scope permission.
//   Do I need to implement their given sign-in button, so that it will remember this?
//   It's workable right now, but not optimal.

var google = require('googleapis');
var oauth2 = google.auth.OAuth2;
var plus = google.plus('v1');

var async = require('async');

var env = (function() {
	var Habitat = require('habitat');
	Habitat.load();
	return new Habitat();
}());

var oauth2client = new oauth2(env.get('GOOGLE_ID'), env.get('GOOGLE_SECRET'), 'http://localhost:3000/oauth2callback');

var scopes = [
	'https://www.googleapis.com/auth/plus.me',				// know who user is in Google
	'https://www.googleapis.com/auth/userinfo.email'		// view email address
];

exports.get_url = function() {
	var url = oauth2client.generateAuthUrl({
		access_type: 'offline',			//  offline will get you a refresh token
		scope: scopes
	});
	return url;
}

var authenticate = function(code, cb) {
	oauth2client.getToken(code, function(err, tokens) {
		if(err) {
			console.log('1');
			console.log(err);
		} else {
			oauth2client.setCredentials(tokens);
			cb(tokens);
		}
	});
};

exports.get_info = function(code, cb) {
	authenticate(code, function(tokens) {
		plus.people.get({ userId: 'me', auth: oauth2client }, function(err, profile) {
			if(err) {
				console.log('2');
				console.log(err);
			} else {
				var email_var = "";
				for(var i=0; i < profile.emails.length; i++) {
					//   Finding the umich account tied to Google account
					if(profile.emails[i].value.split('@')[1] == "umich.edu") {
						email_var = profile.emails[i].value;
						break;		//   assuming only ONE umich account.
					}
				}
				//   TODO: What happens if there are no umich accounts associated?
				obj = {
					name: profile.name.givenName,
					email: email_var,
					token: tokens.access_token
				}
				cb(obj);
			}
		});
	});
};

exports.logout = function(token) {
	oauth2client.revokeToken(token);
}