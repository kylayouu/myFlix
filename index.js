const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;
mongoose.connect('mongodb://localhost:27017/showFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express'),
	morgan = require('morgan'),
  bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('common'));

app.get('/', (req, res) => {
	res.send('Watching movies is definitely one of my hobbies!');
});

app.get('/movies', (req, res) => {
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

app.post('/users/register', (req, res) => {
	Users.findOne( {Username: req.body.Username} ).then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + ' already exists');
    } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
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