const Cerita = require('../model/cerita');

exports.getShare = (req, res, next) => {
  Cerita.find({})
    .populate('userId')
    .then(data => {
      res.render('share/index', {
        cerita: data,
        path: '/'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getDetail = (req, res, next) => {
  const ceritaId = req.params.ceritaId;

  Cerita.findById(ceritaId)
    .populate('userId')
    .then(data => {
      res.render('share/read', {
        singleCerita: data,
        path: '/detail'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
