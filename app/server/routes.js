
var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');

var professors = [
	{
		name: 'Walker White',
		major: 'Comp Sci',
		spec: 'Game Design',
		desc: 'I am a mathematical logician by training. My original work was in computable model theory. From this work I moved onto the design of high-level languages for databases and information systems in computer science.'
	},{
		name: 'John Mayes',
		major: 'Math',
		spec: 'Mathematical Biology',
		desc: 'My research interests include general relativity, relativistic astrophysics, cosmology, and quantum fields in curved spacetime. Currently, one focus of my group\'s research is understanding various sources of.'
	},{
		name: 'Anthony Bella',
		major: 'Physics',
		spec: 'Molecular Biophysics',
		desc: 'My lab studies emergent physical phenomena that arise from interactions between elementary constituents. The systes we study include suspensions of microscopic particles, the macromolecules in.'
	},{
		name: 'Manan Chugh',
		major: 'Comp Sci',
		spec: 'Game Design',
		desc: 'I am a mathematical logician by training. My original work was in computable model theory. From this work I moved onto the design of high-level languages for databases and information systems.'
	},{
		name: 'Snoop Dog',
		major: 'Math',
		spec: 'Mathematical Biology',
		desc: 'My research interests include general relativity, relativistic astrophysics, cosmology, and quantum fields in curved spacetime. Currently, one focus of my group\'s research is understanding various sources of.'
	},{
		name: 'Anthony Trello',
		major: 'Physics',
		spec: 'Molecular Biophysics',
		desc: 'My lab studies emergent physical phenomena that arise from interactions between elementary constituents. The systes we study include suspensions of microscopic particles, the macromolecules in.'
	},{
		name: 'Krunt Jordan',
		major: 'History',
		spec: 'Anthropology',
		desc: 'I have a focus on colonialism, cultural entanglement, and indigenous autonomy. My research centers on the archaeology of Iroquois (Haudenosaunee) peoples, emphasizing the settlement patterns, housing, and political economy of seventeenth- and eighteenth- century Senecas.'
	},{
		name: 'Daniel Brash',
		major: 'Biology',
		spec: 'Molecular Biology',
		desc: 'We are interested in how animals develop, evolve and form new species. We use a variety of techniques including genetics, developmental biology and molecular evolution.'
	},{
		name: 'Donald Greenberg',
		major: 'Comp Sci',
		spec: 'Computer Graphics',
		desc: 'My research is primarily concerned with advancing the state-of-the-art technologies in computer graphics and utilizing these techniques as they may be applied to a variety of disciplines. My current computer science research projects involve realistic image generation, parallel processing algorithms for rendering, new graphical user interfaces, and computer animation.'
	},{
		name: 'Kyle Shen',
		major: 'Physics',
		spec: 'Quantum Physics',
		desc: 'Our research focuses on studying how strong quantum correlations between electrons can give rise to phenomena, such as high-temperature superconductivity, colossal magnetoresistance, or electron fractionalization.'
	}
];

module.exports = function(app) {

// main login page //
	app.get('/', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { title: 'Hello - Please Login To Your Account' });
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/home');
				}	else{
					res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});

	app.post('/', function(req, res){
		AM.manualLogin(req.body['user'], req.body['pass'], function(e, o){
			if (!o){
				res.status(400).send(e);
			}	else{
				req.session.user = o;
				if (req.body['remember-me'] == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.status(200).send(o);
			}
		});
	});

// logged-in user homepage //

	app.get('/home', function(req, res) {
		if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}else if(req.session.user.firstLogin == 'false'){
			res.render('home', {
				title : 'Control Panel',
				countries : CT,
				udata : req.session.user
			});
		}else{
			res.render('firstLogin', {
				title: 'Proffy',
			});
		}
	});

	app.post('/home', function(req, res){
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			AM.updateAccount({
				id		: req.session.user._id,
				name	: req.body['name'],
				email	: req.body['email'],
				pass	: req.body['pass'],
				country	: req.body['country']
			}, function(e, o){
				if (e){
					res.status(400).send('error-updating-account');
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });
					}
					res.status(200).send('ok');
				}
			});
		}
	});

	app.post('/logout', function(req, res){
		res.clearCookie('user');
		res.clearCookie('pass');
		req.session.destroy(function(e){ res.status(200).send('ok'); });
	})

// creating new accounts //

	app.get('/signup', function(req, res) {
		res.render('signup', {  title: 'Signup', countries : CT });
	});

	app.post('/signup', function(req, res){
		AM.addNewAccount({
			name 	: req.body['name'],
			email 	: req.body['email'],
			user 	: req.body['user'],
			pass	: req.body['pass'],
			country : req.body['country'],
			firstLogin: 'true'
		}, function(e){
			if (e){
				res.status(400).send(e);
			}	else{
				res.status(200).send('ok');
			}
		});
	});

	app.post('/setInfo', function(req, res){
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			AM.updateAccount({
				id		: req.session.user._id,
				course1	: req.body['course1'],
				experience1	: req.body['experience1'],
				interests1	: req.body['interests1'],
				course2	: req.body['course2'],
				experience2: req.body['experience2'],
				interests2	: req.body['interests2'],
				firstLogin : 'false'
			}, function(e, o){
				if (e){
					res.status(400).send('error-updating-account');
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });
					}
					res.status(200).send('ok');
				}
			});
		}
	});

// User Settings //

app.get('/settings', function(req, res) {
	if (req.session.user == null){
// if user is not logged-in redirect back to login page //
		res.redirect('/');
	}else{
		res.render('settings', {
			title : 'User Settings',
			udata : req.session.user
		});
	}
});

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.body['email'], function(o){
			if (o){
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// TODO add an ajax loader to give user feedback //
					if (!e){
						res.status(200).send('ok');
					}	else{
						for (k in e) console.log('ERROR : ', k, e[k]);
						res.status(400).send('unable to dispatch password reset');
					}
				});
			}	else{
				res.status(400).send('email-not-found');
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});

	app.post('/reset-password', function(req, res) {
		var nPass = req.body['pass'];
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.status(200).send('ok');
			}	else{
				res.status(400).send('unable to update password');
			}
		})
	});

	app.get('/search', function(req, res) {
		if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}else{
			var queryKeys = req.query.query.split(' ');
			var pushProfs = [];
			for (var i = 0; i < professors.length; i++){
				for (var property in professors[i]){
					var words = (professors[i])[property].split(' ');
					for (var j = 0; j < words.length; j++){
						for (var k = 0; k < queryKeys.length; k++){
							if(words[j].toUpperCase() == queryKeys[k].toUpperCase() && pushProfs.indexOf(professors[i]) == -1){
								pushProfs.push(professors[i]);
							}
						}
					}
				}
			}
			res.render('search', {
				title: 'Proffy',
				profs: pushProfs
			});
		}
	});

// view & delete accounts //

	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { title : 'Account List', accts : accounts });
		})
	});

	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
				req.session.destroy(function(e){ res.status(200).send('ok'); });
			}	else{
				res.status(400).send('record not found');
			}
	    });
	});

	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');
		});
	});

	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};
