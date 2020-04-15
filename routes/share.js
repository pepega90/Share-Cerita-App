const express = require( 'express' );

const router = express.Router();

const shareController = require( '../controller/share' );

router.get( '/', shareController.getShare );

router.get( '/detail/:ceritaId', shareController.getDetail );

router.post( '/detail/:ceritaId', shareController.postKomen );


module.exports = router;
