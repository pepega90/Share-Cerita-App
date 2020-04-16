const { validationResult } = require( 'express-validator/check' );

const Cerita = require( '../model/cerita' );

exports.getAddCerita = ( req, res, next ) => {
  res.render( 'admin/addCerita', {
    editMode: false,
    path: '/add-cerita',
    pesanError: null,
    hasError: '',
    errMsg: []
  } );
};

exports.getMyCerita = ( req, res, next ) => {
  Cerita.find( { userId: req.user._id } )
    .populate( 'userId' )
    .then( data => {
      res.render( 'admin/myCerita', {
        cerita: data,
        path: '/mycerita'
      } );
    } )
    .catch( err => {
      const error = new Error( err );
      error.httpStatusCode = 500;
      return next( error );
    } );
};

exports.getEditCerita = ( req, res, next ) => {
  const editing = req.query.edit;
  if ( !editing ) {
    res.redirect( '/' );
  }
  const ceritaId = req.params.ceritaId;
  Cerita.findById( ceritaId )
    .then( cerpen => {
      if ( !cerpen ) {
        return res.redirect( '/' );
      }
      res.render( 'admin/addCerita', {
        cerpen: cerpen,
        editMode: editing,
        path: '/edit-cerita',
        hasError: '',
        pesanError: null,
        errMsg: []
      } );
    } )
    .catch( err => console.log( err ) );
};

exports.postAddCerita = ( req, res, next ) => {
  const title = req.body.title;
  const image = req.file;
  const cerita = req.body.cerita;
  if ( !image ) {
    return res.status( 422 ).render( 'admin/addCerita', {
      editMode: false,
      cerpen: {
        title: title,
        cerita: cerita
      },
      hasError: true,
      path: '/add-cerita',
      pesanError: 'Harus bertipe gambar',
      errMsg: []
    } );
  }
  const errorMessage = validationResult( req );
  if ( !errorMessage.isEmpty() ) {
    return res.status( 422 ).render( 'admin/addCerita', {
      editMode: false,
      cerpen: {
        title: title,
        cerita: cerita
      },
      hasError: true,
      path: '/add-cerita',
      pesanError: errorMessage.array()[ 0 ].msg,
      errMsg: errorMessage.array()
    } );
  }

  const gambar = image.path;

  const cerpen = new Cerita( {
    title: title,
    image: gambar,
    cerita: cerita,
    userId: req.user._id
  } );

  cerpen
    .save()
    .then( result => {
      res.redirect( '/' );
    } )
    .catch( err => {
      const error = new Error( err );
      error.httpStatusCode = 500;
      return next( error );
    } );
};

exports.postEditCerita = ( req, res, next ) => {
  const ceritaId = req.body.ceritaId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedCerita = req.body.cerita;
  const errorMessage = validationResult( req );
  if ( !errorMessage.isEmpty() ) {
    return res.status( 422 ).render( 'admin/addCerita', {
      editMode: true,
      hasError: false,
      path: '/edit-cerita',
      cerpen: {
        title: updatedTitle,
        image: image,
        cerita: updatedCerita,
        _id: ceritaId
      },
      pesanError: errorMessage.array()[ 0 ].msg,
      errMsg: errorMessage.array()
    } );
  }
  Cerita.findById( ceritaId )
    .then( cerita => {
      if ( cerita.userId.toString() !== req.user._id.toString() ) {
        return res.redirect( '/' );
      }
      cerita.title = updatedTitle;
      if ( image ) {
        cerita.image = image.path;
      }
      cerita.cerita = updatedCerita;

      return cerita.save().then( result => {
        console.log( 'UPDATED PRODUCT!' );
        res.redirect( '/admin/mycerita' );
      } );
    } )
    .catch( err => {
      const error = new Error( err );
      error.httpStatusCode = 500;
      return next( error );
    } );
};

exports.postDeleteCerita = ( req, res, next ) => {
  const ceritaId = req.params.ceritaId;

  Cerita.deleteOne( { _id: ceritaId, userId: req.user._id } )
    .then( result => {
      console.log( 'DESTROY CERITA' );
      res.redirect( '/admin/mycerita' );
    } )
    .catch( err => {
      const error = new Error( err );
      error.httpStatusCode = 500;
      return next( error );
    } );
};
