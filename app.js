// ========== app.js ===============//
/////////////////////////////////////

//required modulesa
const express = require('express'),
	passport = require('passport'),
	session = require('express-session'),
	flash = require('connect-flash'),
	mysql = require('mysql2');
const bodyParser = require('body-parser');
//Passport config
require('./config/passport')(passport);
const db = require('./config/db');
const content = require('./routes/content.js');
const employees = require('./routes/employees/employees');
const timesheets = require('./routes/timesheets/timesheet');
const gallery = require('./routes/gallery');

const app = express();

// EJS
app.set('view engine', 'ejs');

// Body Parser
// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//EXPRESS-SESSION
app.use(
	session({
		secret: 'totally super secret thing',
		resave: true,
		saveUninitialized: true
	})
);

//
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Global vars
app.use(function(req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});

app.use('/public', express.static(__dirname + '/public'));

// MySQL Connection

// Routes
app.use('/content', content);
app.use('/employees', employees);
app.use('/timesheets', timesheets);
app.use('/gallery', gallery);

app.get('/', function(req, res) {
	res.render('index');
});

let port = process.env.PORT || 80;

app.listen(port, function() {
	console.log('Listening on port ' + port);
});