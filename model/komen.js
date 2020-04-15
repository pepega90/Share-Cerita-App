const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const komenSkema = new Schema( {
  username: {
    type: String
  },
  komentar: {
    type: String,
  }
} );

module.exports = mongoose.model( 'Komen', komenSkema );
