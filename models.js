var mongoose = require('mongoose');

// var localConn = mongoose.createConnection('mongodb://localhost/test'); // connection à la base mongo locale
var artistSchema = mongoose.Schema({
	name: String,
    dicName: String,
	image: Array,
	stats: Object,
	tags: Array,
	bio: Object,
	rating: Number,
  	progs: Array,
  	starred: Number
});
var relProgSchema = mongoose.Schema({
	progId: Number,
	artistes: Array,
	tags: Array,
	categories: Array,
	concert: Number,
	startDate: Number,
	endDate: Number,
	titre: String,
	chaine: String
});

// var ratedArtistModel = localConn.model('artists', artistSchema, 'artists');
// var lastfmArtistModel = localConn.model('lastfmartists', artistSchema, 'lastfmartists');
// var relProgModel = localConn.model('relProg', relProgSchema, 'relProg');
// var tagsModel = localConn.model('tags', new mongoose.Schema(), 'tags');


var prodConn = mongoose.createConnection('mongodb://BIDSI:mong0pwd4BI@logsr7.canallabs.fr:27018/R7'); // connection a la base R7

var bddpSchema = mongoose.Schema({
	progId: Number,
	metadata : [{ type: mongoose.Schema.Types.ObjectId, ref: 'relProg' }]
});


var bddpModel = prodConn.model('bddp', { name: String }, 'bddp');
var prodArtistModel = prodConn.model('artists', { name: String }, 'artists');
var logsModel = prodConn.model('logsGaspard', new mongoose.Schema(), 'logsGaspard')
var historyModel = prodConn.model('history', new mongoose.Schema(), 'history')
module.exports = {
  // ratedArtist: ratedArtistModel,
  // lastfmArtist: lastfmArtistModel,
  // relProg: relProgModel,
  // tags: tagsModel,

  bddp: bddpModel,
  prodArtist: prodArtistModel,
  logs: logsModel,
  history: historyModel
};
