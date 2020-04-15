const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const ceritaSchema = new Schema( {
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  cerita: {
    type: String,
    required: true
  },
  comment: [
    {
      komentar: { type: Schema.Types.ObjectId, ref: 'Komen' }
    }
  ],
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },

}, { timestamps: true } );

module.exports = mongoose.model( 'Cerita', ceritaSchema );
