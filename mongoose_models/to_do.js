var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Todo = new Schema({
  todos: [{
    what: String,
    users: [String]
  }]
});

module.exports = mongoose.model('Todo', Todo);
