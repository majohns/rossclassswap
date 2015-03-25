var https = require('https');
var querystring = require('querystring');

var tokenHost = 'api-km.it.umich.edu';
var tokenPath = '/token';

var key = '4EZScGSJfjAFAhhOkGjH3b5sKMEa';
var secret = 'TMo4DDaYnxgWb_zBOTiee1VayMca';
var token = '';

var apiUrl = 'http://api-gw.it.umich.edu/Curriculum/SOC/v1';

function getToken() {
	var postData = querystring.stringify({
		'grant_type' : 'client_credentials',
		'scope' : 'PRODUCTION'
	});
	
	var options = {
		hostname: tokenHost,
		path: tokenPath,
		port: 443,
		method: 'POST',
		headers: {
			'Authorization' : 'Basic ' + (new Buffer(key+':'+secret).toString('base64')), 
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Content-Length': postData.length
		}
	};
	
	var req = https.request(options, function(res) {
	  if (res.statusCode != 200)
		  console.err('Error: Schedule api token request failed');
	  res.setEncoding('utf8');
	  res.on('data', function (data) {
		  token = JSON.parse(data).access_token;
	  });
	  res.on('end', function () {
		  console.log('Got access token: ' + token);
	  });
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	// write data to request body
	req.write(postData);
	req.end();
}

getToken();