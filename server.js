var http = require('http');
var https = require('https');
var querystring = require('querystring');

var tokenHost = 'api-km.it.umich.edu';
var tokenPath = '/token';
var key = '4EZScGSJfjAFAhhOkGjH3b5sKMEa';
var secret = 'TMo4DDaYnxgWb_zBOTiee1VayMca';

var apiUrl = 'api-gw.it.umich.edu';


// Get an access token for schedule API
function getToken(callback) {
	var postData = querystring.stringify({
		'grant_type' : 'client_credentials',
		'scope' : 'PRODUCTION'
	});
	
	var options = {
		hostname: tokenHost,
		path: tokenPath,
		method: 'POST',
		headers: {
			'Authorization' : 'Basic ' + (new Buffer(key+':'+secret).toString('base64')), 
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Content-Length': postData.length
		}
	};
	
	var req = https.request(options, function(res) {
		var token = '';
		if (res.statusCode != 200)
		  console.err('Error: Schedule api token request failed');
		res.setEncoding('utf8');
		res.on('data', function (data) {
			token = JSON.parse(data).access_token;
		});
		res.on('end', function () {
			console.log('Got access token: ' + token);
			callback(token);
		});
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	// write data to request body
	req.write(postData);
	req.end();
}

// 
function callAPI(token, path, callback) {
	var allData = '';
	var options = {
		host: apiUrl,
		path: '/Curriculum/SOC/v1' + path,
		headers: {'Authorization': 'Bearer ' + token}
	}
	http.get(options, function (res){
		res.setEncoding('utf8');
		res.on('data', function (data){
			allData += data;
		});
		res.on('end', function (){
			callback(JSON.parse(allData));
		});
	});
}

function parseSubjects (obj){
	console.log(JSON.stringify(obj));
}

getToken(function (token) {
	callAPI(token, '/Terms/2020/Schools/BA/Subjects', parseSubjects);
});