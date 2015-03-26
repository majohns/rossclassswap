var express = require('express');				//   used for routing
var app = express();							//   enable express module
app.set('views', __dirname + '/views');			//   set default "views" directory
app.set('view engine', 'jade');					//   enable jade.

var bodyParser = require('body-parser');		//   for express handling POST
app.use(bodyParser.urlencoded({ extended : false }));
var search_str = "";
var pref_bits = 0;

var async = require('async');

var auth = require('./assets/javascripts/auth.js');
var key = "";
var expire_time = new Date();

var api = require('./assets/javascripts/UMapi.js');
var core_classes = ['TO 300', 'BE 300', 'STRATEGY 425'];
var subject_info = null;
api.set_core_classes(core_classes);

const PORT = 3000;

//   Routing Requests
app.get('/', function (request, response) {
	pref_bits = 0;			//   reset search preferences
	if(expire_time >= new Date()) {
		//   Cached Data
		response.render('home', {data: {'subjects': core_classes, 'sections': subject_info}});
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
			response.render('home', {data: {'subjects': core_classes, 'sections': subject_info}});
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

app.get('/search', function(req, res) {
	if(search_str == "") {
		res.redirect('/');
	} else {
		res.render('search_results', {data: {'subjects': core_classes, 'sections': subject_info, 
			'params' : search_str}});
	}
});

//   TODO: Security issue?
app.get('/assets/javascripts/search_form.js', function(req, res) {
	res.sendFile(__dirname + '/assets/javascripts/search_form.js');
});

app.listen(PORT);		//   start server
console.log('Server running at http://localhost:' + PORT + '/');