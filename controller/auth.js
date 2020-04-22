const bcrypt = require( 'bcryptjs' );
const { validationResult } = require( 'express-validator/check' );
const nodemailer = require( 'nodemailer' )
const sendgridTransport = require( 'nodemailer-sendgrid-transport' )
const crypto = require( 'crypto' );

const transporter = nodemailer.createTransport( sendgridTransport( {
  auth: {
    api_key: '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'
  }
} ) );

const User = require( '../model/user' );

exports.getLogin = ( req, res, next ) => {
  let pesanError = req.flash( 'error' );
  if ( pesanError.length > 0 ) {
    pesanError = pesanError[ 0 ];
  } else {
    pesanError = null;
  }
  res.render( 'auth/login', {
    path: '/login',
    isMasuk: false,
    pesanError: pesanError,
    errMsg: [],
    oldInput: {
      email: '',
      password: ''
    }
  } );
};

exports.getDaftar = ( req, res, next ) => {
  let pesanError = req.flash( 'error' );
  if ( pesanError.length > 0 ) {
    pesanError = pesanError[ 0 ];
  } else {
    pesanError = null;
  }
  res.render( 'auth/daftar', {
    path: '/daftar',
    isMasuk: false,
    pesanError: pesanError,
    errMsg: [],
    oldInput: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  } );
};

exports.postDaftar = ( req, res, next ) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errorMsg = validationResult( req );
  if ( !errorMsg.isEmpty() ) {
    return res.status( 422 ).render( 'auth/daftar', {
      path: '/daftar',
      isMasuk: false,
      pesanError: errorMsg.array()[ 0 ].msg,
      errMsg: errorMsg.array(),
      oldInput: {
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword
      }
    } );
  }
  bcrypt
    .hash( password, 12 )
    .then( hashedPass => {
      const user = new User( {
        username: username,
        email: email,
        password: hashedPass
      } );
      return user.save();
    } )
    .then( result => {
      res.redirect( '/login' );
      transporter.sendMail( {
        from: 'shareCeritaAdmin@gmail.com',
        to: email,
        subject: 'Daftar Sukses',
        html: '<h1>Anda telah terdaftar</h1>'
      } )
    } )
    .catch( err => {
      const error = new Error( err );
      error.httpStatusCode = 500;
      return next( error );
    } );
};

exports.postLogin = ( req, res, next ) => {
  const email = req.body.email;
  const password = req.body.password;
  const errorMsg = validationResult( req );
  if ( !errorMsg.isEmpty() ) {
    console.log( errorMsg.array() );
    return res.status( 422 ).render( 'auth/login', {
      path: '/login',
      isMasuk: false,
      pesanError: errorMsg.array()[ 0 ].msg,
      errMsg: errorMsg.array(),
      oldInput: {
        email: email,
        password: password
      }
    } );
  }
  User.findOne( { email: email } )
    .then( user => {
      if ( !user ) {
        return res.status( 422 ).render( 'auth/login', {
          path: '/login',
          isMasuk: false,
          pesanError: 'Invalid Email Or Password',
          errMsg: [],
          oldInput: {
            email: email,
            password: password
          }
        } );
      }

      bcrypt
        .compare( password, user.password )
        .then( matchPass => {
          if ( matchPass ) {
            req.session.isLogin = true;
            req.session.user = user;
            return req.session.save( err => {
              res.redirect( '/' );
            } );
          }
          return res.status( 422 ).render( 'auth/login', {
            path: '/login',
            isMasuk: false,
            pesanError: 'Invalid Email or Password',
            errMsg: [],
            oldInput: {
              email: email,
              password: password
            }
          } );
        } )
        .catch( err => {
          console.log( err );
          res.redirect( '/daftar' );
        } );
    } )
    .catch( err => {
      const error = new Error( err );
      error.httpStatusCode = 500;
      return next( error );
    } );
};

exports.postLogout = ( req, res, next ) => {
  req.session.destroy( err => {
    console.log( err );
    res.redirect( '/' );
  } );
};


exports.getReset = ( req, res, next ) => {
  let pesanError = req.flash( 'error' );
  if ( pesanError.length > 0 ) {
    pesanError = pesanError[ 0 ];
  } else {
    pesanError = null;
  }
  res.render( 'auth/reset', {
    path: '/reset',
    pesanError: pesanError,
    errMsg: [],
    oldInput: {
      email: '',
      password: ''
    }
  } );
}


exports.postReset = ( req, res, next ) => {
  crypto.randomBytes( 32, ( err, buffer ) => {
    if ( err ) {
      return res.redirect( '/reset' );
      const error = new Error( err );
      error.httpStatusCode = 500;
      return next( error );
    }
    const token = buffer.toString( 'hex' );
    User.findOne( { email: req.body.email } )
      .then( user => {
        if ( !user ) {
          req.flash( 'error', 'Tidak ada akun dengan email itu' );
          return redirect( '/' )
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      } )
      .then( result => {
        res.redirect( '/' )
        transporter.sendMail( {
          from: 'shareCeritaAdmin@gmail.com',
          to: req.body.email,
          subject: 'Permintaan Reset Password',
          html: `
            <h1>Anda Melakukan Permintaan Reset Password</h1>
            <p>Klik <a href="http://localhost:4000/reset/${token}">Link Ini</a> untuk password baru</p>
        `
        } )
      } )
      .catch( err => {
        const error = new Error( err );
        error.httpStatusCode = 500;
        return next( error );
      } )
  } );
}



exports.getNewPassword = ( req, res, next ) => {
  const token = req.params.token;
  User.findOne( { resetToken: token, resetTokenExpiration: { $gt: Date.now() } } )
    .then( user => {
      let pesanError = req.flash( 'error' );
      if ( pesanError.length > 0 ) {
        pesanError = pesanError[ 0 ];
      } else {
        pesanError = null;
      }
      res.render( 'auth/newPassForm', {
        path: '/newPassForm',
        errorMessage: pesanError,
        userId: user._id.toString(),
        passwordToken: token
      } );
    } )
    .catch( err => {
      const error = new Error( err );
      error.httpStatusCode = 500;
      return next( error );
    } );
};

exports.postNewPassword = ( req, res, next ) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne( {
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId
    } )
    .then( user => {
      resetUser = user;
      return bcrypt.hash( newPassword, 12 );
    } )
    .then( hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    } )
    .then( result => {
      res.redirect( '/login' );
    } )
    .catch( err => {
      const error = new Error( err );
      error.httpStatusCode = 500;
      return next( error );
      console.log( err )
    } );
};
