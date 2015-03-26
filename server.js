var express = require('express');				//   used for routing
var app = express();							//   enable express module
app.use(express.static('app'));					//   TODO: security issue?
app.set('views', __dirname + '/views');			//   set default "views" directory
app.set('view engine', 'jade');					//   enable jade.

var bodyParser = require('body-parser');		//   for express handling POST
app.use(bodyParser.urlencoded({ extended : false }));

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

app.post('/search', function(request, response) {
	console.log("received");
	response.render('search_results', {data: {'subjects': core_classes, 'sections': subject_info}});
});

app.listen(PORT);		//   start server
console.log('Server running at http://localhost:' + PORT + '/');