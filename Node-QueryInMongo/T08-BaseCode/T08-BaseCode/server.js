//Create express app
const express = require('express');
const bodyParser = require('body-parser');
let app = express();

//Database variables
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let db;

//View engine
app.set("view engine", "pug");

//Set up the routes
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", sendIndex);
app.get("/cards/:cardID", sendCard);

app.post('/result', function (req, res) {
    //res.render('the_template', { name: req.body.name });
	//console.log(req.body.name);
	var cardClass = req.body.class;
	var cardRarity = req.body.rarity;
	var minAttack = req.body.minattack===""?0:parseInt(req.body.minattack);
	var maxAttack = req.body.maxattack===""?100000:parseInt(req.body.maxattack);
	var minHealth = req.body.minhealth===""?0:parseInt(req.body.minhealth);
	var maxHealth = req.body.maxhealth===""?100000:parseInt(req.body.maxhealth);

	var artist = req.body.artist;
	var name = req.body.name;
	// console.log(minAttack);
	// console.log(maxAttack);
	// console.log(minHealth);
	// console.log(maxHealth);
	
	
	db.collection("cards").find({"cardClass":cardClass,"rarity":cardRarity,"name":{ $regex:new RegExp(name, "i")},"artist":{$regex:new RegExp(artist, "i")},"attack":{$gte:minAttack,$lte:maxAttack},"health":{$gte:minHealth,$lte:maxHealth}}).toArray(function(err, result){
		if(err){
			res.status(500).send("Error reading database.");
			return;
		}
		if(!result){
			res.status(404).send("No results");
			return;
		}
		//console.log(result);
		res.status(200).render("searchResult", {result:result});
	})
});

function sendIndex(req, res, next){
	res.render("index");
}

function sendCard(req, res, next){
	let oid;
	try{
		oid = new mongo.ObjectID(req.params.cardID);
	}catch{
		res.status(404).send("Unknown ID");
		return;
	}

	db.collection("cards").findOne({"_id":oid}, function(err, result){
		if(err){
			res.status(500).send("Error reading database.");
			return;
		}
		if(!result){
			res.status(404).send("Unknown ID");
			return;
		}
		console.log(result);
		res.status(200).render("card1", {test:result});

	});
}

// Initialize database connection
MongoClient.connect("mongodb://localhost:27017/", function(err, client) {
  if(err) throw err;

  //Get the t8 database
  db = client.db('t8');

  // Start server once Mongo is initialized
  app.listen(3000);
  console.log("Listening on port 3000");
});
