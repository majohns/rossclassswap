var express = require('express');				//   used for routing
var app = express();							//   enable express module
app.set('views', __dirname + '/views');			//   set default "views" directory
app.set('view engine', 'jade');					//   enable jade.

//   Configure env file, for security reasons.
var env = (function() {
	var Habitat = require('habitat');
	Habitat.load();
	return new Habitat();
}());

//   Session Management. resave is required, so that we can monitor when people
//   login, (so we can "expire" a request), and saveUninitialized is set to false
//   because we don't need to keep track of an empty session that is never modified.
var session = require('express-session');
app.use(session({secret: env.get("SESSION_SECRET"), 
	saveUninitialized: false, resave: true}));
var sess;		//   used in functions as representative of current session

var bodyParser = require('body-parser');		//   for express handling POST
app.use(bodyParser.urlencoded({ extended : false }));
var url = require('url');						//   for parsing GET commands.
var search_str = "";
var pref_bits = 0;								//   binary encoding of section preferences

var async = require('async');					//   for asynchronous requests.

//   Authentication protocols with UMapi
var auth = require('./assets/javascripts/auth.js');
var key = "";
var expire_time = new Date();

//   Interaction with UMapi
var api = require('./assets/javascripts/UMapi.js');
var core_classes = ['TO 300', 'BE 300', 'STRATEGY 390'];
var subject_info = null;
api.set_core_classes(core_classes);

//   Authentication protocols for Google Login
var google = require('./assets/javascripts/google_auth.js');

app.use(express.static(__dirname + '/public'));					 //   access to stylesheets
app.use(express.static(__dirname + '/node_modules/bootstrap'));	 //   access to bootstrap

const PORT = 3000;

//   Routing Requests
app.get('/', function (request, response) {
	sess = request.session;
	
	pref_bits = 0;			//   reset search preferences
	if(expire_time >= new Date()) {
		//   Cached Data
		response.render('home', {data: {'login': sess.user != null, 'name': sess.user,
			'subjects': core_classes, 'sections': subject_info}});
		return;
	}
	async.waterfall([
		function(callback) {
			auth.get_access_token(function(val, time) {
				//   Want to save a local copy of keys, for future access.
				key = val;
				expire_time = time;
				callback(null);
			});
		},
		function(callback) {
			api.set_api_key(key);
			api.get_subject_info(function(data) {
				subject_info = data;
				callback(null);
			});
		}, function(callback) {
			response.render('home', {data: {'login': sess.user != null, 'name': sess.user,
				'subjects': core_classes, 'sections': subject_info}});
		}
	]);
});

app.post('/', function(request, response) {
	//   TODO: Validation of input (required fields)
	search_str = request.body.section_dropdown;
	var arr = Object.keys(request.body);
	for(var i=2; i < arr.length; i++) {
		//   NOTE: Assumes no other form input after section_dropdown besides check boxes.
		pref_bits += Math.pow(2, parseInt(arr[i].substring(6).split(',')[1]) - 1);
	}
	response.redirect('/search');
});

//   Redirect to Google Login
app.get('/login', function(req, res) {
	res.redirect(google.get_url());

//  vv For testing vv
//	sess = req.session;
//	res.render('login', {data: {'login': sess.user != null}});
});

//   Not used, since we're authenticating through Google.
//   vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
app.post('/login', function(req, res) {
	sess = req.session;
	
	if(req.body.username == "") {
		res.render('login', {data: {'login': sess.user != null, 'error': true}});
	} else if(req.body.username == "test") {
		res.redirect(google.get_url());
	} else {
		//   OMG, so unsecure.
		sess.user = req.body.username;
		res.redirect('/');
	}
});
//   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

app.get('/logout', function(req, res) {
	sess = req.session;
	google.logout(sess.token);
	
	req.session.destroy(function(err) {
		if(err) {
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
	
});

app.get('/dashboard', function(req, res) {
	sess = req.session;
	if(sess.user) {
		res.render('dashboard', {data: {'login': sess.user != null} });
	} else {
		res.redirect('/login');		//   if try to access dashboard directly
	}
});

app.get('/search', function(req, res) {
	if(search_str == "") {
		res.redirect('/');
	} else {
		res.render('search_results', {data: {'login': sess.user != null, 'name': sess.user,
			'subjects': core_classes, 'sections': subject_info, 'params' : search_str}});
	}
});

//   Authorized redirect URL from Google developer's console. Code will be in URL as GET command.
app.get('/oauth2callback', function(req, res) {
	var code = url.parse(req.url, true).query.code;
	google.get_info(code, function(obj) {
		if(obj.email == "") {
			//   TODO: Can't find umich account, throw error?
		} else {
			sess = req.session;
			sess.user = obj.name;
			sess.email = obj.email;
			sess.token = obj.token;
		}
		console.log(obj.name + ',', obj.email, ':', obj.token);
		res.redirect('/');
	});
});

//   TODO: Security issue?
app.get('/assets/javascripts/search_form.js', function(req, res) {
	res.sendFile(__dirname + '/assets/javascripts/search_form.js');
});

app.listen(PORT);		//   start server
console.log('Server running at http://localhost:' + PORT + '/');