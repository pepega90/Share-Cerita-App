const express = require( 'express' );

const router = express.Router();

const { check, body } = require( 'express-validator/check' );

const User = require( '../model/user' );

const authController = require( '../controller/auth' );

router.get( '/login', authController.getLogin );

router.post(
  '/login',
  [
    body( 'email', 'Invalid Email' ).isEmail(),
    body( 'password', 'Masukkan password minimal 5 karakter dan alfanumeric' )
      .isLength( { min: 5 } )
      .isAlphanumeric()
  ],
  authController.postLogin
);

router.post( '/logout', authController.postLogout );

router.get( '/daftar', authController.getDaftar );

router.post(
  '/daftar',
  [
    body( 'username' )
      .trim()
      .custom( ( value, { req } ) => {
      return User.findOne( { username: value } ).then( username => {
        if ( username ) {
          return Promise.reject( 'Username Sudah Digunakan' );
        }
      } );
    } ),
    body( 'email' )
      .isEmail()
      .withMessage( 'Please enter a valid email' )
      .custom( ( value, { req } ) => {
      return User.findOne( { email: value } ).then( userDoc => {
        if ( userDoc ) {
          return Promise.reject( 'Email ini Sudah Terdaftar' );
        }
      } );
    } )
      .normalizeEmail(),
    body( 'password', 'Masukkan password minimal 5 karakter dan alfanumeric' )
      .trim()
      .isLength( { min: 5 } )
      .isAlphanumeric(),
    body( 'confirmPassword' )
      .trim()
      .custom( ( value, { req } ) => {
      if ( value !== req.body.password ) {
        throw new Error( 'Password Tidak Sama' );
      }
      return true;
    } )
  ],
  authController.postDaftar
);

router.get( '/reset', authController.getReset )

router.post( '/reset', authController.postReset )

router.get( '/reset/:token', authController.getNewPassword );

router.post( '/new-password', authController.postNewPassword );

module.exports = router;
