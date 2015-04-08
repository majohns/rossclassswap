var nodemailer = require('nodemailer');

var env = (function() {
	var Habitat = require('habitat');
	Habitat.load();
	return new Habitat();
}());

var transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: env.get('MAIL_USER'),
		pass: env.get('MAIL_PASSWORD')
	}
});

//   TODO: Finish off default mailer.
var configure_mail_options = function(email) {
	const LOGIN_PAGE = "http://localhost:3000/"
	
	//   Can't use the backslash for multi-line string, due to formatting issues in mailing.
	var body = "It's a great day!\n\n" +
		"We found someone to sections with you, for your class <class name>!\n\n" +
		"GIVING: \t\t\t Section <section number>, <time>\n" +
		"RECEIVING:\t\tSection <section number>, <time>\n\n" +
		"Please login to " + LOGIN_PAGE + " to complete this swap within the next 24 hours, " +
		"to prevent this offer from expiring!\n\n" +
		"Best,\n" +
		"EzySwap Team"
	
	//   TODO: Do we need a HTML email format?
	var mail_options = {
		to: email,
		subject: 'Swap Request for <class name>!',
		text: body
	};
	
	return mail_options;
}

exports.send_mail = function(email) {
	var options = configure_mail_options(email);
	transporter.sendMail(options, function(err, info) {
		if(err) {
			console.log(err);
		} else {
			console.log('Message sent: ' + info.response);
		}
	});
}