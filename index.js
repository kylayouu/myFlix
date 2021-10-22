const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const app = express();
const mongoose = require('mongoose');

const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

// mongoose.connect('mongodb://localhost:27017/showFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb+srv://kylayouu:atlasmongo29@mydatabases.x3rp7.mongodb.net/showFlixDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

// use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// authorization
// (app) ensures Express is available in your auth.js file
let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport');

// use of morgan
app.use(morgan('common'));

app.get('/', (req, res) => {
	res.send('Watching movies is definitely one of my hobbies!');
});

app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.find().then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.get('/movies/:Title', (req, res) => {
	Movies.findOne({Title: req.params.Title}).then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.get('/genres/:Name', (req, res) => {
	Movies.findOne({'Genre.Name': req.params.Name}).then((genre) => {
    res.json(genre.Genre)
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.get('/directors/:Name', (req, res) => {
	Movies.findOne({'Director.Name': req.params.Name}).then((director) => {
    res.json(director.Director)
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.post('/users/register', [
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne( {Username: req.body.Username} ).then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
            FavoriteMovies: req.body.FavoriteMovies
          })
          .then((user) => {
            res.status(201).json(user)
          })
          .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
          })
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

app.put('/users/:Username', (req, res) => {
	Users.findOneAndUpdate({Username: req.params.Username}, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  }).then((updatedUser) => {
    res.status(201).json(updatedUser)
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  });
});

app.post('/users/:Username/favorites/:MovieID', (req,res) => {
  Users.findOneAndUpdate({Username: req.params.Username},
    { $push: {FavoriteMovies: req.params.MovieID} },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
  });
});

app.delete('/users/:Username/favorites/:MovieID', (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username},
    { $pull: {FavoriteMovies: req.params.MovieID} },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
  });
});

app.delete('/users/:Username', (req, res) => {
	Users.findOneAndRemove({Username: req.params.Username}).then((user) => {
    if (!user) {
      res.status(400).send(req.params.Username + ' was not found.');
    } else {
      res.status(200).send(req.params.Username + ' was successfully deleted.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('There has been an error!');
});

app.listen(8080, () => {
	console.log('Your app is listening on port 8080.');
});