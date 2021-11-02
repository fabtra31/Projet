// Appel des libraries

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
const { DateTime } = require("luxon");

// Initialisation connexion DB

mongoose.connect('mongodb://localhost:27017/betcha');
const db = mongoose.connection;
db.on('error', console.error.bind(console, '[x] Pas connecté à la DB'));

db.once('open', function () {
	console.log("[*] Connecté à la DB");
});

// APPEL Des fichiers de creation BD
const User = mongoose.model('User', require('./MongoDB/users'));
const Parties = mongoose.model('Partie', require('./MongoDB/parties'))

// APPEL DES MIDDLEWARE
app.use(express.urlencoded({ extended: true }))
app.use(express.static('views'))
app.set('view engine', 'ejs')
app.use("/", express.static(path.resolve(`${process.cwd()}${path.sep}assets`)));
app.use(cookieParser());
app.use(express.json())

// PARTIE SESSIONS
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
	secret: "IUBhdeiNDEAhdfAEF80H",
	saveUninitialized: true,
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

		if (result) {
			res.redirect('/login')
			console.log("a user has been created :" + req.body.username)

		}
		else {
			res.redirect('/sign-up')
		}

	})
});

// POST pour la connection
app.post('/api/login', async function (req, res) {
	await User.findOne({
			username: req.body.username
	})
		.then(function (user) {
			if (!user) return res.redirect('/sign-up');
			bcrypt.compare(req.body.password, user.password, function (err, result) {
				if (!result) return res.redirect('/login')

				req.session.user = {
					id: user._id,
					username: user.username
				};
				res.redirect('/home');
			})
		})
});

// GET pour lister les users
app.get("/api/list_users", async function (req, res) {
	if (!req.session.user) {
		return res.sendStatus(401)
	}
	await User.find({}).then(function (users) {
		var listUsers = [];

		for (let index = 0; index < users.length; index++) {
			const element = users[index];

			if (req.session.user && req.query.no_owner) {
				if (element._id != req.session.user.id) {
					listUsers.push({
						id: element._id,
						username: element.username
					});
				}
			} else {
				listUsers.push({
					id: element._id,
					username: element.username
				});
			}

			if (index == users.length - 1) {
				return res.json({ total: listUsers.length, users: listUsers });
			}
		}
		return res.json({ total: listUsers.length, users: listUsers });
	})
})

// GET pour lister toutes les parties
app.get('/api/list_parties', async function (req, res) {
	if (!req.session.user) {
		return res.sendStatus(401)
	}
	const validStatus = ["WAITING", "STARTED", "FINISHED"];
	let parameters = {};
	if (req.query.type && validStatus.includes(req.query.type)){
		parameters.status = req.query.type;
	}
	await Parties.find(parameters).then((parties) => {
		var listParties = [];
		
		for (let index = 0; index < parties.length; index++) {
			const element = parties[index];

			listParties.push({
				id: element._id,
				round: element.round,
				J1: element.J1,
				J2: element.J2,
				specs: element.specs,
				status: element.status,
				pointer: element.pointer
			});
			if (index == parties.length - 1) {
				return res.json({ total: parties.lenght, parties: listParties });
			}
		}
		return res.json({ total: parties.lenght, parties: []});
	})
})


// lister les parties crées par le Owner
app.get('/api/myparties', async function (req, res) {
	if (!req.session.user) {
		return res.sendStatus(401)
	}

	let parameters = {J1: req.session.user.id};

	await Parties.find(parameters).then((parties) => {
		var listParties = [];
		
		for (let index = 0; index < parties.length; index++) {
			const element = parties[index];

			listParties.push({
				id: element._id,
				round: element.round,
				J1: element.J1,
				J2: element.J2,
				specs: element.specs,
				status: element.status,
				pointer: element.pointer
			});
			if (index == parties.length - 1) {
				return res.json({ total: parties.lenght, parties: listParties });
			}
		}
		return res.json({ total: parties.lenght, parties: []});
	})
})

app.get("/api/invites", async function(req, res) {
    
	if (!req.session.user) {
		return res.sendStatus(401)
	}
	let params = {
        "$and": [
            { status: "WAITING"}, 
            {"J2.id": req.session.user.id}
        ]

    };


    await Parties.find(params).then(function (games) {
        var finalList = [];

        for (let index = 0; index < games.length; index++) {
            const element = games[index];

            finalList.push({
                id: element._id,
                round: element.round,
                pointer: element.pointer,
                J1: element.J1,
				J2: element.J2,
                specs: element.specs,
                status: element.status
            });

            if (index == games.length-1) {
                return res.json({total: games.length, parties: finalList});
            }
        }

        return res.json({total: games.length, parties: []});
    })
})

//GET pour les parties (ID)
app.get('/api/party/:id', async function (req, res) {
	if (!req.session.user) {
		return res.sendStatus(401)
	}
	await Parties.findById(req.params.id)
		.then(function (party) {
		if (!party){
			return res.sendStatus(404)
		}
		return res.json({party})
	});
})

//get pour accepter les invites
app.get('/party/:id/accept', async function (req, res) {
	if (!req.session.user) {
		return res.sendStatus(401)
	}
	await Parties.findById(req.params.id)
		.then(async function (party) {
		if (!party){
			return res.sendStatus(404)
		}
		if (party.J2.id != req.session.user.id){
			return res.sendStatus(403)
		}
		if (party.status != "WAITING"){
			return res.sendStatus(403)
		}

		await Parties.findByIdAndUpdate(req.params.id, {status: "STARTED"})

		return res.redirect(`/party/${req.params.id}`)
	});
})

//get pour decliner les invites
app.get('/party/:id/deny', async function (req, res) {
	if (!req.session.user) {
		return res.sendStatus(401)
	}
	await Parties.findById(req.params.id)
		.then(async function (party) {
		if (!party){
			return res.sendStatus(404)
		}
		if (party.J2.id != req.session.user.id){
			return res.sendStatus(403)
		}
		if (party.status != "WAITING"){
			return res.sendStatus(403)
		}
		await Parties.findByIdAndDelete(req.params.id)

		return res.redirect("/home")
	});
})

app.get('/api/party/:id/delete', async function (req, res) {
	if (!req.session.user) {
		return res.sendStatus(401)
	}
	await Parties.findById(req.params.id)
		.then(async function (party) {
		if (!party){
			return res.sendStatus(404)
		}

		if (party.J1.id != req.session.user.id){
			return res.sendStatus(403)
		}
		if (party.status != "WAITING"){
			return res.sendStatus(501)
		}
		await Parties.findByIdAndDelete(req.params.id)

		return res.redirect("/home")
	});

})

app.post('/api/party', async function (req, res) {
	if (!req.session.user) return res.sendStatus(401);
	const party = new Parties({
		J1: {
			id: req.session.user.id,
		},
		J2: {
			id: req.body.opposant,
		}
	});
	let result = await party.save();

	if (!result) return res.redirect("/home");
	console.log('Creation of the party');
	return res.redirect("/home");
})

app.post("/api/party/:id/heartbeat", async function (req, res) {
    if (!req.session.user) return res.sendStatus(401);
    await Parties.findById(req.params.id).then(async function (game) {
        if (!game) return res.sendStatus(404);
		if (game.status == "FINISHED") return res.sendStatus(403);

        if (game.J1.id == req.session.user.id) {
			await Parties.findByIdAndUpdate(req.params.id, {
				"J1.connected": true,
				"J1.last_update": Date.now()
			});
		} else {
			await Parties.findByIdAndUpdate(req.params.id, {
				"J2.connected": true,
				"J2.last_update": Date.now()
			});
		}
        
		
        
        return res.json({success: true});
    });
});

app.get('/api/user',async function (req, res) {
	if (!req.session.user) return res.sendStatus(401);
	let parameters = {
		where: { _id: req.session.user.id },
	};

	await User.findOne(parameters).then((user) => {
		if (!user) {
			return res.sendStatus(404)
		}
		let listData = {};
		listData.id = user._id;
		listData.username = user.username;
		listData.stats = user.stats;
		
		return res.json(listData);
	})
});

app.get('/api/user/:id', async function (req, res) {
	await User.findById(req.params.id)
	.then((user) => {
		if (!user) {
			return res.sendStatus(404)
		}
		let listData = {};
		listData.id = user._id;
		listData.username = user.username;
		listData.stats = user.stats;
		
		return res.json(listData);
	})
});


// PARTIE RENDERING HTML
//GET menu 
app.get('/', function (req, res) {
	res.render("index.ejs", { req: req, title: "Accueil" })
});
//GET pour les pseudos


// GET pour le login
app.get('/login', function (req, res) {
	if (req.session.user) {
		return res.redirect('/home');
	}
	res.render("login.ejs", { req: req, title: "Connection au jeu" })
});

// GET pour le signup
app.get('/sign-up', function (req, res) {
	if (req.session.user) {
		return res.redirect('/home');
	}
	res.render("signup.ejs", { req: req, title: "Bienvenue sur le jeu Betcha" })
});

// GET pour le home
app.get('/home', function (req, res) {
	if (!req.session.user) {
		return res.redirect('/login');
	}
	res.render("home.ejs", { req: req, title: "Welcome on Betcha game" })
});

//Get pour les parties 
app.get('/party/:id', async function (req, res) {
	if (!req.session.user) {
		return res.redirect('/login');
	}

	await Parties.findOne({
			_id: req.params.id
	}).then(async function (party) {
		if (!party){
			return res.redirect('/home');
		}
		let user1 = await User.findById(party.J1.id);
		let user2 = await User.findById(party.J2.id);

		let type = null

		if (user1.id ==  req.session.user.id || user2.id == req.session.user.id) {
			type = true;
		}
		else{
			type = false;
		}
		return res.render("party.ejs", { req: req, title: "Game of "+user1.username+ " and " + user2.username, party: party, isplayer: type, usernames: [user1.username, user2.username]})
	});
})

// GEt pour le logout
app.get('/logout', function (req, res) {
	req.session.destroy();
	res.redirect('/')
});


app.listen(4000, () => {
	console.log("Serveur démarré sur le port 4000")
})

app.post("/api/party/:id/secretNumber", async function (req, res) {
    if (!req.session.user) return res.sendStatus(401);
    await Parties.findById(req.params.id).then(async function (game) {
        if (!game) return res.sendStatus(404);
		if (game.status != "STARTED") return res.sendStatus(403);
		
        if (game.J1.id == req.session.user.id) {
			await Parties.findByIdAndUpdate(req.params.id, {
				"J1.bet": req.body.nb
			});
		} else if (game.J2.id == req.session.user.id) {
			await Parties.findByIdAndUpdate(req.params.id, {
				"J2.bet": req.body.nb
			});
		} else {
			return res.sendStatus(403);
		}

        return res.json({success: true});
    });
});

setInterval(async () => {

	await checkConnected();

	await refreshParty();
}, 2000)

async function checkConnected() {
	let games = await Parties.find({ 
		"$or": [
			{"J1.connected": true}, 
			{"J2.connected": true}
		]
	})

	games.forEach(async (game) => {
		if (game.J1.connected) {
			if (DateTime.now().diff(DateTime.fromJSDate(game.J1.last_update), 'seconds').toObject().seconds > 5) {
				game.J1.connected = false;
			}
		}
		
		if (game.J2.connected) {
			if (DateTime.now().diff(DateTime.fromJSDate(game.J2.last_update), 'seconds').toObject().seconds > 5) {
				game.J2.connected = false;
			}
		}

		await game.save();
	})
}

async function refreshParty() {
	let games = await Parties.find({ 
		status: "STARTED"
	})
	await games.forEach(async (game) => {
		console.log(game.event);
		if (game.event == "wait" && game.J1.connected && game.J2.connected) {
			await Parties.findByIdAndUpdate(game._id, {
				event: "starting",
				next_event: DateTime.now().plus({seconds: 30}).set({millisecond: 0}).toJSDate()
			})
		} else if (game.event == "starting") {
			await Parties.findByIdAndUpdate(game._id, {
				event: "wait_init"
			})
		} else if (game.event == "wait_init") {
			if (DateTime.now() >= DateTime.fromJSDate(new Date(game.next_event))) {
				await Parties.findByIdAndUpdate(game._id, {
					event: "startRound",
					next_event: DateTime.now().plus({seconds: 30}).set({millisecond: 0}).toJSDate()
				})
			}
		} else if (game.event == "startRound") {
			await Parties.findByIdAndUpdate(game._id, {
				'J1.mise': 0,
				'J2.mise': 0,
				event: "wait_endRound"
			})
		} else if (game.event == "wait_endRound") {
			if (DateTime.now() >= DateTime.fromJSDate(new Date(game.next_event))) {
				await Parties.findByIdAndUpdate(game._id, {
					event: "show_result",
					next_event: DateTime.now().plus({seconds: 15}).set({millisecond: 0}).toJSDate()
				})
			}
		} else if (game.event == "show_result") {

			let miseJ1 = 0;
            let miseJ2 = 0;

            if (game.J1.bet == 0) {
                miseJ1 = Math.floor(Math.random() * game.J1.coins);
                await Parties.findByIdAndUpdate(game._id, {
                    "J1.bet": miseJ1
                })
            } else {
                miseJ1 = game.J1.bet
            }

            if (game.J2.bet == 0) {
                miseJ2 = Math.floor(Math.random() * game.J1.coins);
                await Parties.findByIdAndUpdate(game._id, {
                    "J2.bet": miseJ2
                })
            } else {
                miseJ2 = game.J2.bet
            }

            if (miseJ1 > miseJ2) {

                let new_pointer = game.pointer + 1;
                let next_round = game.round + 1;
                let new_thune = ((game.J1.coins - game.J1.bet) <= 0) ? 0 : game.J1.coins - game.J1.bet;


                await Parties.findByIdAndUpdate(game._id, {
                    "pointer": new_pointer,
                    "round": next_round,
                    "J1.coins": new_thune
                })
            } else if (miseJ1 < miseJ2 ) {

                let new_pointer = game.pointer - 1;
                let next_round = game.round +1;
                let new_thune = ((game.J2.coins - game.J2.bet) <= 0) ? 0 : game.J2.coins - game.J2.bet;


                await Parties.findByIdAndUpdate(game._id, {
                    "pointer": new_pointer,
                    "round": next_round,
                    "J2.coins": new_thune
                })
                
            } else if (miseJ1 == miseJ2) {

                let new_pointer = game.pointer;
                let next_round = game.round +1;

                await Parties.findByIdAndUpdate(game._id, {
                    "pointer": new_pointer,
                    "round": next_round,
                })

            }
			
			await Parties.findByIdAndUpdate(game._id, {
                "event": 'end_round',
                "next_event": DateTime.now().plus({seconds: 15}).set({millisecond: 0}).toJSDate(),
            })

		} else if (game.event == "end_round") {
			
		}
	})
}