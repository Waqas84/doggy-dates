let db = require("../models");
const yelp = require('yelp-fusion');
let passport = require("../config/passport");
let cookie = require("cookie");

module.exports = function(app) {
    // Using the passport.authenticate middleware with our local strategy.
    // If the user has valid login credentials, send them to the members page.
    // Otherwise the user will be sent an error
    app.post("/api/login", passport.authenticate("local"), function(req, res) {
        // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
        // So we're sending the user back the route to the members page because the redirect will happen on the front end
        // They won't get this or even be able to access this page if they aren't authed
        res.json("/members");
    });


    app.post("/profile_form", function(req, res){
        console.log('POSTING');
        db.Dogs.create(req.body).then(function(data) {
          res.redirect("/");
        });
        // console.log(req.body);
    });

    // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
    // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
    // otherwise send back an error
    app.post("/api/signup", function(req, res) {
        // console.log(req.body);
        
        req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
        req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);
        req.checkBody('password', 'Password field cannot be empty.').notEmpty();
        req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);
        req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");

        var errors = req.validationErrors();

        if (errors) {
            console.log("errors: " + JSON.stringify(errors));
        } else {
            db.User.create({
                email: req.body.email,
                password: req.body.password
            }).then(function() {
                res.redirect(307, "/api/login");
            });
        }
    });

  app.get("/results", function(req, res) {
	const clientId = 'iMwvylbqrydUu45E4CD0Hg';
	const clientSecret = 'IzZ1gqChie6JtsJKt6qjzEfj2eCesJlEPzUIUcj5nU1FRxjAvDJLXvIOnGyfvgjC';

	let searchTerm = "dog parks";
	let searchLoc = "san diego, ca"

	const searchRequest = {
	  term: searchTerm,
	  location: searchLoc
	};

	yelp.accessToken(clientId, clientSecret).then(response => {
	  const client = yelp.client(response.jsonBody.access_token);

	  client.search(searchRequest).then(response => {
		const firstResult = response.jsonBody.businesses[0];
		const prettyJson = JSON.stringify(firstResult, null, 4);    

		let parksObj = {
			parks: response.jsonBody.businesses //data is a array of objects
		};

		console.log("RESULTS JSON", response.jsonBody.businesses);
		res.render("yelp_results", parksObj);
	  	
	  });
	});

    });

    // Route for logging user out
    app.get("/logout", function(req, res) {
        req.logout();
        res.redirect("/");
    });

    // Route for getting some data about our user to be used client side
    app.get("/api/user_data", function(req, res) {
        if (!req.user) {
            // The user is not logged in, send back an empty object
            res.json({});
        } else {

            // Set a cookie on login
            res.setHeader('Set-Cookie', cookie.serialize('id', req.user.id, {
              httpOnly: true,
              maxAge: 60 * 60 * 24 * 7 // 1 week 
            }));

            // Parse the cookies on the request 
            var cookies = cookie.parse(req.headers.cookie || '');

            // Get the user id set in the cookie 
            var userCookie = cookies.id;
            console.log(userCookie);

            // Otherwise send back the user's email and id
            // Sending back a password, even a hashed password, isn't a good idea
            res.json({
                email: req.user.email,
                id: req.user.id
            });
            
        }
    });

    // Redirect the user to Facebook for authentication.  When complete,
    // Facebook will redirect the user back to the application at
    //     /auth/facebook/callback
    app.get(
        '/auth/facebook', 
        passport.authenticate('facebook', { scope: ['email'] })
    );

    // Facebook will redirect the user to this URL after approval.  Finish the
    // authentication process by attempting to obtain an access token.  If
    // access was granted, the user will be logged in.  Otherwise,
    // authentication has failed.
    app.get(
        '/auth/facebook/callback', 
        passport.authenticate('facebook', { failureRedirect: '/' }),
        function(req, res) {
            console.log('fb callback')
            res.json("successfully logged in");
        }
     );

};
