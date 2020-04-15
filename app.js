const path = require( 'path' );
const express = require( 'express' );

const bodyParser = require( 'body-parser' );
const mongoose = require( 'mongoose' );
const flash = require( 'connect-flash' );
const session = require( 'express-session' );
const multer = require( 'multer' );

const app = express();

const fileStorage = multer.diskStorage( {
  destination: ( req, file, cb ) => {
    cb( null, 'images' );
  },
  filename: ( req, file, cb ) => {
    cb(
      null,
      new Date().toISOString().replace( /:/g, '-' ) + '-' + file.originalname
    );
  }
} );

const fileFilter = ( req, file, cb ) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb( null, true );
  } else {
    cb( null, false );
  }
};

// CONTROLLER
const errorController = require( './controller/error' );

// MODELS
const User = require( './model/user' );

// ROUTES
const shareRoutes = require( './routes/share' );
const adminRoutes = require( './routes/admin' );
const authRoutes = require( './routes/auth' );

//VIEW ENGINE
app.set( 'view engine', 'ejs' );
app.set( 'views', 'views' );

// MIDDLEWARE
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( multer( { storage: fileStorage, fileFilter: fileFilter } ).single( 'image' ) );
app.use( express.static( path.join( __dirname, 'public' ) ) );
app.use( '/images', express.static( path.join( __dirname, 'images' ) ) );
app.use(
  session( {
    secret: 'aji',
    resave: false,
    saveUninitialized: false
  } )
);
app.use( flash() );
app.use( ( req, res, next ) => {
  res.locals.isMasuk = req.session.isLogin;
  next();
} );

app.use( ( req, res, next ) => {
  if ( !req.session.user ) {
    return next();
  }
  User.findById( req.session.user )
    .then( user => {
      if ( !user ) {
        return next();
      }
      req.user = user;
      next();
    } )
    .catch( err => {
      next( new Error( err ) );
    } );
} );

app.use( '/admin', adminRoutes );
app.use( shareRoutes );
app.use( authRoutes );

app.get( '/500', errorController.get500 );

app.use( errorController.get404 );

app.use( ( error, req, res, next ) => {
  res.status( 500 ).render( '500', {
    path: '/500'
  } );
} );

// CONNECTING DATABASE VIA MONGOOSE
mongoose
  .connect( 'mongodb://localhost:27017/sharing' )
  .then( result => {
    app.listen( 4000 );
    console.log( 'Connect To Mongodb' );
  } )
  .catch( err => console.log( err ) );
