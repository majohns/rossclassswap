var querystring = require('querystring');
var https = require('https');
var async = require('async');

var env = (function() {
	var Habitat = require('habitat');
	Habitat.load();
	return new Habitat();
}());
var CONSUMER_KEY = env.get("CONSUMER_KEY");
var CONSUMER_SECRET = env.get("CONSUMER_SECRET");

exports.get_access_token = function getToken(cb) {
	var access_token = "";
	var access_token_expire_time = new Date();
	
	var postData = querystring.stringify({
		'grant_type' : 'client_credentials',
		'scope' : 'PRODUCTION'
	});
	
	var options = {
		hostname: 'api-km.it.umich.edu',
		path: '/token',
		port: 443,
		method: 'POST',
		headers: {
			'Authorization' : 'Basic ' + (new Buffer(CONSUMER_KEY+':'+CONSUMER_SECRET).toString('base64')), 
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Content-Length': postData.length
		}
	};
	
	var req = https.request(options, function(res) {
		if (res.statusCode != 200)
			console.err('Error: Schedule api token request failed');
		res.setEncoding('utf8');
		res.on('data', function (data) {
			access_token = JSON.parse(data).access_token;
			access_token_expire_time.setTime(Date.now() + JSON.parse(data).expires_in * 1000);
		});
		res.on('end', function () {
			//console.log('Got access token: ' + access_token);
			cb(access_token, access_token_expire_time);				//  return values to parent function
		});
	});
	
	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});
	
	// write data to request body
	req.write(postData);
	req.end();
}