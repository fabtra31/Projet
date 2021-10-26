// Appel des libraries

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");

// Initialisation connexion DB

mongoose.connect('mongodb://localhost:27017/betcha');
const db = mongoose.connection;
db.on('error', console.error.bind(console, '[x] Pas connecté à la DB'));

db.once('open', function () {
	console.log("[*] Connecté à la DB");
});

// APPEL Des fichiers de creation BD
const User = mongoose.model('User', require('./MongoDB/users'));
const Parties = mongoose.model('Game', require('./MongoDB/parties'))

// APPEL DES MIDDLEWARE
app.use(express.urlencoded({ extended: true }))
app.use(express.static('views'))
app.set('view engine', 'ejs')
app.use("/", express.static(path.resolve(`${process.cwd()}${path.sep}assets`)));
app.use(cookieParser());

// PARTIE SESSIONS
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "IUBhdeiNDEAhdfAEF80H",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

/* API USERS */

// POST pour l'inscription
app.post('/api/sign-up', async function (req, res) {
	bcrypt.hash(req.body.password, 15, async function (err, hash) {
		const user = new User({
			username: req.body.username,
			password: hash
		})
		let result = await user.save()

		console.log(result)
		if (result) {
			res.redirect('/login')
			console.log("a user has been created :")
			console.log(req.body.username)

		}
		else {
			console.log("")
			res.redirect('/sign-up')
		}

	})
});

// POST pour la connection
app.post('/api/login', async function (req, res) {
	await User.findOne({
		where: {
			username: req.body.username
		}
	})
		.then(function (user) {
			if (!user) return res.redirect('/sign-up');
			bcrypt.compare(req.body.password, user.password, function (err, result) {
				if (!result) return res.redirect('/login')
				req.session.user = {
					id: user._id,
					username: user.username
				}
				res.redirect('/home');
			})
		})
});

// GET pour lister les users

app.get('/api/list_users', async function (req, res) {
	await User.find({}).then((users) => {
		var listUsers = [];
		for (let index = 0; index < users.length; index++) {
			const element = users[index];
			
			listUsers.push({
				id: element._id,
				username : element.username,
			})
			if (index == users.length-1) {
				return res.json({total: users.lenght, users: listUsers})
			}
		}
	})
})

// GET pour lister toutes les parties
app.get('/api/list_parties', async function (req, res) {
	await Parties.find({}).then((parties) => {
		var listParties = [];
		for (let index = 0; index < parties.length; index++) {
			const element = parties[index];
			
			listParties.push({
				id: element._id,
				round: element.round,
				J1: element.J1,
				J2: element.J2,
				specs: element.specs
			})
			if (index == parties.length-1) {
				return res.json({total: parties.lenght, parties: listParties})
			}
		}
		return res.json({total: parties.lenght, parties: listParties})
	})
})






// PARTIE RENDERING HTML
	//GET menu 
	app.get('/', function(req, res) {
		res.render("index.ejs", { req: req, title: "Accueil"})
	});


	// GET pour le login
	app.get('/login', function (req, res) {
		res.render("login.ejs", { req: req, title: "Connection au jeu"})
	});

	// GET pour le signup
	app.get('/sign-up', function (req, res) {
		res.send("ok_sign_up")
	});

	// GET pour le home
	app.get('/home', function (req, res) {
		res.send("ok_home")
	});

	// GET pour les 
	app.get('/app/parties_list', function (req, res) {
		res.send('POST request to the homepage');
	});

	// GEt pour le logout
	app.get('/logout', function(req, res) {
		req.session.destroy();
		res.redirect('/')
	});

	app.listen(4000, () => {
		console.log("Serveur démarré sur le port 4000")
	}
	)
