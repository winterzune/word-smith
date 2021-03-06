var express = require("express");
var mongoose = require("mongoose");

// Our scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 8080;

// Initialize Express
var app = express();

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
//revise after
///
////////
mongoose.connect("mongodb://localhost/word-smith", { useNewUrlParser: true });

// Routes
// A GET route for scraping the UrbanDictionary website
// First, tell the console what server.js is doing
console.log("\n******************************************\n" +
            "Grabbing trending words, definition and link\n" +
            "from the UrbanDictionary website:" +
            "\n******************************************\n");

// Making a request via axios for `nhl.com`'s homepage
axios.get("https://www.urbandictionary.com/").then(function(response) {

  // Load the body of the HTML into cheerio
  var $ = cheerio.load(response.data);

  // Empty array to save our scraped data
  var results = [];

  // With cheerio, find each div-tag with the class "def-panel" and loop through the results
  $("div.def-panel").each(function(i, element) {

    // find the decendant of def-panel, that is an a-tag with the class "word" and then Save the text of the a-tag as "title"
    var title = $(element).find("a.word").text();

    // find the decendant of def-panel, in div-tag with the class "meaning" and Save the text of the div-tag as "meaning"
    var meaning = $(element).find("div.meaning").text();

    // Find a-tag called "word", and save it's href value as "link"
    var link = $(element).find("a.word").attr("href");

    // Make an object with data we scraped for this h4 and push it to the results array
    results.push({
      title: title,
      meaning: meaning,
      link: link
    });
  });

  // After looping through each word, log the results
  /////
  /////
  /////
  console.log(results[0]);
});


// Route for getting all Words from the db
app.get("/words", function(req, res) {
  // Grab every document in the Words collection
  db.Words.find({})
    .then(function(dbWords) {
      // If we were able to successfully find Words, send them back to the client
      res.json(dbWords);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Word by id, populate it with it's comments
app.get("/words/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("comments")
    .then(function(dbWords) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbWords);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Word's associated Comment
app.post("/words/:id", function(req, res) {
  // Create a new comment and pass the req.body to the entry
  db.Comments.create(req.body)
    .then(function(dbComments) {
    
      return db.words.findOneAndUpdate({ _id: req.params.id }, { note: dbComments._id }, { new: true });
    })
    .then(function(dbWords) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbWords);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
