const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator/check');

const User = require('../model/user');

exports.getLogin = (req, res, next) => {
  let pesanError = req.flash('error');
  if (pesanError.length > 0) {
    pesanError = pesanError[0];
  } else {
    pesanError = null;
  }
  res.render('auth/login', {
    path: '/login',
    isMasuk: false,
    pesanError: pesanError,
    errMsg: [],
    oldInput: {
      email: '',
      password: ''
    }
  });
};

exports.getDaftar = (req, res, next) => {
  let pesanError = req.flash('error');
  if (pesanError.length > 0) {
    pesanError = pesanError[0];
  } else {
    pesanError = null;
  }
  res.render('auth/daftar', {
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
  });
};

exports.postDaftar = (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errorMsg = validationResult(req);
  if (!errorMsg.isEmpty()) {
    return res.status(422).render('auth/daftar', {
      path: '/daftar',
      isMasuk: false,
      pesanError: errorMsg.array()[0].msg,
      errMsg: errorMsg.array(),
      oldInput: {
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword
      }
    });
  }
  bcrypt
    .hash(password, 12)
    .then(hashedPass => {
      const user = new User({
        username: username,
        email: email,
        password: hashedPass
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errorMsg = validationResult(req);
  if (!errorMsg.isEmpty()) {
    console.log(errorMsg.array());
    return res.status(422).render('auth/login', {
      path: '/login',
      isMasuk: false,
      pesanError: errorMsg.array()[0].msg,
      errMsg: errorMsg.array(),
      oldInput: {
        email: email,
        password: password
      }
    });
  }
  User.findOne({email: email})
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          isMasuk: false,
          pesanError: 'Invalid Email Or Password',
          errMsg: [],
          oldInput: {
            email: email,
            password: password
          }
        });
      }

      bcrypt
        .compare(password, user.password)
        .then(matchPass => {
          if (matchPass) {
            req.session.isLogin = true;
            req.session.user = user;
            return req.session.save(err => {
              res.redirect('/');
            });
          }
          return res.status(422).render('auth/login', {
            path: '/login',
            isMasuk: false,
            pesanError: 'Invalid Email or Password',
            errMsg: [],
            oldInput: {
              email: email,
              password: password
            }
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/daftar');
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
