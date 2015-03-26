var http = require('http');
var bl = require('bl');
var async = require('async');

//   TODO: Edit core_classes, such that it factors in semesters dividers.
var core_classes;
var subject_info = new Array();
var api_key = "";
var term_code = "";

exports.set_core_classes = function(arr) {
	core_classes = arr;
}

exports.set_api_key = function(key) {
	api_key = key;
}

exports.get_subject_info = function(cb) {
	async.waterfall([
		function(callback) {
			get_recent_term(function(data) {
				console.log("Retrieved TermCode for " + data.getSOCTermsResponse.Term[0].TermDescr);
				callback(null, data.getSOCTermsResponse.Term[0].TermCode);
			});
		}, function(arg1, callback) {
			get_subjects_info(arg1, function() {
				callback(null);
			});
		}
	], function(callback) {
		cb(subject_info);
	});
}

function customize_options(path_in) {
	var options = {
		host : "api-gw.it.umich.edu",
		path : path_in,
		headers : {
			"Authorization" : "Bearer " + api_key,
		}
	};
	return options;
}

function run_request(path_in, func, section) {
	console.log("Accessing: " + path_in);
	
	var str_dump;
	
	var request = http.get(customize_options(path_in), function(response) {
		response.setEncoding('utf-8');
		
		response.pipe(bl(function(err, data) {
			if(err) {
				//   TODO: Implement refresh access token here?
				console.log("request error: " + err.message);
			} else {
				str_dump = JSON.parse(data);
			}
		}));
		
		response.on("end", function() {
			if(section) {
				//   Used for getting subject info.
				var data = new Array();
				data[0] = str_dump;
				data[1] = path_in.split('/')[9] + " " + path_in.split('/')[11];
				func(data);
			} else {
				func(str_dump);
			}
		})
	});
	
	request.on("error", function(err) {
		console.log("Error retrieving information: " + err.message);
	});
}

function extract_section_info(element) {
	var arr = new Array();
	
	//   TODO: Should this be optimized? Unnecessary layering, but easy to expand.
	arr["Time"] = new Array();
	
	if(typeof element.Meeting.length === 'undefined') {
		//   Only one meeting time
		arr["Time"][0] = new Array();
		arr["Time"][0]["Days"] = element.Meeting.Days;
		arr["Time"][0]["Time"] = element.Meeting.Times;
	} else {
		for(var i=0; i < element.Meeting.length; i++) {
			arr["Time"][i] = new Array();
			arr["Time"][i]["Days"] = element.Meeting[i].Days;
			arr["Time"][i]["Time"] = element.Meeting[i].Times;
		}
	}
	return arr;
}

//   EFFECTS: Gets the most recent term (usually, the next semester)
//   NOTE: Need to set up, before can call function.
function get_recent_term(cb) {
	run_request("/Curriculum/SOC/v1/Terms", cb, false);
}

//   EFFECTS: Adds core classes to subject_info array.
function get_subjects_info(term_code, cb) {
	var count = 0;
	var func = function(data) {
		console.log("Processing: " + data[1]);
		subject_info[data[1]] = new Array();
		
		if(typeof data[0].getSOCSectionsResponse.Section.length === 'undefined') {
			//   Only one section detected
			subject_info[data[1]][0] = 
				extract_section_info(data[0].getSOCSectionsResponse.Section);
		} else {
			for(var i=0; i < data[0].getSOCSectionsResponse.Section.length; i++) {
				subject_info[data[1]][i] = 
					extract_section_info(data[0].getSOCSectionsResponse.Section[i]);
			}
		}
		

//		data[0].getSOCSectionsResponse.Section.forEach(function (element, index, arr) {
//			subject_info[data[1]][index] = extract_section_info(element);
//		});
		
		if(++count == core_classes.length) {
			cb();		//  signal done.
		}
	}
	
	core_classes.forEach(function(element, index, arr) {
		var subject_code = element.split(" ")[0];
		var catalog_num = element.split(" ")[1];
		subject_info[element] = new Array();
		
		run_request("/Curriculum/SOC/v1/Terms/" + term_code + "/Schools/BA/Subjects/"
			+ subject_code + "/CatalogNbrs/" + catalog_num + "/Sections", func, true);
	})
}