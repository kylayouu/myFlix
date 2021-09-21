const express = require('express'),
	morgan = require('morgan');

const app = express();
app.use(morgan('common'));

let topTenMovies = [
  {
    title: '13 Hours: The Secret Soldiers of Benghazi',
    director: 'Michael Bay'
  },
  {
    title: 'Lord of the Rings: The Fellowship of the Ring',
    direction: 'Peter Jackson'
  },
  {
    title: 'The Twilight Saga: Breaking Dawn - Part 1',
    director: 'Bill Condon'
  },
	{
    title: 'The Twilight Saga: Breaking Dawn - Part 2',
    director: 'Bill Condon'
  },
	{
    title: 'Taken',
    director: 'Pierre Morel'
  },
	{
    title: 'The Notebook',
    director: 'Nick Cassavetes'
  },
	{
    title: 'A Walk to Remember',
    director: 'Adam Shankman'
  },
	{
    title: 'This Means Wars',
    director: 'McG'
  },
	{
    title: 'White Chicks',
    director: 'Keenen Ivory Wayans'
  },
	{
    title: 'The House Bunny',
    director: 'Fred Wolf'
  }
];

app.get('/movies', (req, res) => {
	res.json(topTenMovies);
});

app.get('/', (req, res) => {
	res.send('Watching movies is definitely one of my hobbies!');
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('There has been an error!');
});

app.listen(8080, () => {
	console.log('Your app is listening on port 8080.');
});