var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Pomodoro = new Schema( {}, { strict: false } );

module.exports = mongoose.model('Pomodoro', Pomodoro);
