const express = require( 'express' );

const router = express.Router();

const adminController = require( '../controller/admin' );
const { check, body } = require( 'express-validator/check' );

const isAuth = require( '../middleware/is-auth' );

router.get( '/add-cerita', isAuth, adminController.getAddCerita );

router.post(
  '/add-cerita',
  [
    body( 'title' )
      .notEmpty()
      .withMessage( 'Title harus diisi' )
      .isLength( { min: 5 } )
      .withMessage( 'Minimal 5 karakter' )
      .isString()
      .trim(),
    body( 'cerita', 'Cerita Tidak Boleh Kosong' )
      .notEmpty()
      .isString()
  ],
  isAuth,
  adminController.postAddCerita
);

router.get( '/mycerita', isAuth, adminController.getMyCerita );

router.get( '/edit-cerita/:ceritaId', isAuth, adminController.getEditCerita );

router.post(
  '/edit-cerita',
  [
    body( 'title' )
      .notEmpty()
      .withMessage( 'Title harus diisi' )
      .isLength( { min: 5 } )
      .withMessage( 'Minimal 5 karakter' )
      .isString()
      .trim(),
    body( 'cerita', 'Cerita Tidak Boleh Kosong' )
      .notEmpty()
      .isString()
  ],
  isAuth,
  adminController.postEditCerita
);

router.post(
  '/delete-cerita/:ceritaId',
  isAuth,
  adminController.postDeleteCerita
);

module.exports = router;
