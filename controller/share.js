const Cerita = require( '../model/cerita' );
const Comment = require( '../model/komen' );

exports.getShare = ( req, res, next ) => {
  Cerita.find( {} )
    .populate( 'userId' )
    .then( data => {
      res.render( 'share/index', {
        cerita: data,
        path: '/'
      } );
    } )
    .catch( err => {
      const error = new Error( err );
      error.httpStatusCode = 500;
      return next( error );
    } );
};

exports.getDetail = ( req, res, next ) => {
  const ceritaId = req.params.ceritaId;

  Cerita.findById( ceritaId )
    .populate( 'userId' )
    .populate( 'comment.komentar' )
    .then( data => {
      res.render( 'share/read', {
        singleCerita: data,
        path: '/detail'
      } );
    } )
    .catch( err => {
      const error = new Error( err );
      error.httpStatusCode = 500;
      return next( error );
    } );
};


exports.postKomen = ( req, res, next ) => {
  const ceritaId = req.params.ceritaId;
  const komen = req.body.komentar;
  const username = req.body.username;

  const comment = new Comment( {
    username: username,
    komentar: komen
  } )

  comment.save()
    .then( result => {
      return Cerita.findByIdAndUpdate( { _id: ceritaId }, { $push: { comment: { komentar: result } } } )
    } )
    .then( anotherResult => {
      res.redirect( '/detail/' + ceritaId )
    } )
    .catch( err => {
      const error = new Error( err )
      error.httpStatusCode = 500;
      return next( error )
    } )
}
