/**
 * New node file
 */

var Parse = require('parse').Parse;

//Authenticate w/ app id, js key
Parse.initialize('M6iVmZRp2BDwp0LLWeyAMO39f6QuPeIaEsQe3v2m', 'Pf4RTxdQRrDORg3rKCi35QESxnE2OU8jLwWV6zWz');

//A complex subclass of Parse.Object
var User = Parse.Object.extend("MyUser", {
	// Instance methods
	
	// Instance properties go in an initialize method
	initialize: function (attrs, options) {
		this.email = "";
		this.scheduled = [];
		this.desired = [];
	}
  }, {
	// Class methods
	create : function(email) {
		var user = new User();
		user.set("email", email);
		return user;
	}
});

function create_new_user(email, callback){
	get_user_by_email(email, function(should_be_null){
		if (should_be_null != null) throw 'User with email ' + email + 'already exists!';
		var u = User.create(email);
		u.save(null, {
			success: function(user){
				console.log('Save successful');
				callback(u);
			},
			error: function(user, error){
				console.error('Save failed: ' + error.message);
			}
		});
	});
}

function get_user_by_email(email, callback){
	var query = new Parse.Query(User);
	query.equalTo("email", email);
	query.find({
		success: function(results) {
			console.log(results.length);
			if (results.length === 1)
				callback(results[0]);
			else
				callback(null);
		},
		error: function(error) {
			console.error("Error: " + error.code + " " + error.message);
		}
	});
}

function get_users_by_class_scheduled(){
	
}

function get_users_by_class_desired(){
	
}