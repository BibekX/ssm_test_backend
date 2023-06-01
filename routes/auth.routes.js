const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const authorize = require('../middlewares/auth');
const router = express.Router();

let users = [];
let id = 0;

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './product/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.get("/jwt", authorize, (req, res) => {
  console.log('working');
  res.json("JWT is working");
});

router.post("/items/:id", upload.single('product_image'), (req, res) => {
  console.log('file', req.file);
  console.log('info', JSON.parse(req.body.product));
});

// Sign-up
router.post(
  '/register',
  (req, res, next) => {
    console.log(req.body);

    bcrypt.hash(req.body.password, 10).then((hash) => {
      id++;
      const user = {
        id,
        fbId: '',
        googleId: '',
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hash,
        phone: req.body.phone,
      };
      users.push(user);
      console.log('users signup', users);
      res.status(201).json({
        _id: '123'
      });
    });
  }
);

// Sign-in
router.post('/login', (req, res, next) => {

  let user = users.find(user => user.email === req.body.email);
  console.log('user sign in find', user);
  !user && res.status(401).json({
    message: 'Authentication failed',
  });

  let result = bcrypt.compare(req.body.password, user.password);

  if (result) {
    let jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      'longer-secret-is-better',
      {
        expiresIn: '1h',
      },
    );

    res.status(200).json({
      token: jwtToken,
      expiresIn: 3600,
      id: user.id,
    });
  }
});

// Facebook Sign-in
router.post('/fbsignin', (req, res, next) => {
  console.log('fb', req.body);
  console.log('user', users);
  let user = users.length > 1 && users.find(user => user && user.fbId === req.body.fbId);
  if (user) {
    let jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      'longer-secret-is-better',
      {
        expiresIn: '1h',
      },
    );
    res.status(200).json({
      token: jwtToken,
      expiresIn: 3600,
      id: user.id,
    });
  } else {
    id++;
    const user = {
      id,
      fbId: req.body.fbId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    };
    users.push(user);
    let jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      'longer-secret-is-better',
      {
        expiresIn: '1h',
      },
    );
    res.status(200).json({
      token: jwtToken,
      expiresIn: 3600,
      id: user.id,
    });
  }
});

// Google Sign-in
router.post('/googlesignin', (req, res, next) => {
  console.log('google', req.body);
  console.log('user', users);
  let user = users.length > 1 && users.find(user => user && user.googleId === req.body.googleId);
  if (user) {
    let jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      'longer-secret-is-better',
      {
        expiresIn: '10s',
      },
    );
    res.status(200).json({
      token: jwtToken,
      expiresIn: 3600,
      id: user.id,
    });
  } else {
    id++;
    const user = {
      id,
      googleId: req.body.googleId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    };
    users.push(user);
    let jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      'longer-secret-is-better',
      {
        expiresIn: '10s',
      },
    );
    res.status(200).json({
      token: jwtToken,
      expiresIn: 3600,
      id: user.id,
    });
  }
});

router.get("/orders", authorize, (req, res) => {
  console.log('working');
});


module.exports = router;
