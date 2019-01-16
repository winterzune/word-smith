var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var WordSchema = new Schema({
  // `word` is required and of type String
  word: {
    type: String,
    required: true
  },
  // `definition` is required and of type String
  definition: {
    type: String,
    required: true
  },
  // `link` is required and of type String
  link: {
    type: String,
    required: true
  },
  // `comment` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Word with an associated Comment
  comments: {
    type: Schema.Types.ObjectId,
    ref: "Comments"
  }
});

// This creates our model from the above schema, using mongoose's model method
var Words = mongoose.model("Words", WordSchema);

// Export the Article model
module.exports = Words;