const express = require('express');
const hbs = require('hbs');
const morgan = require('morgan');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const app = express();
const logger = morgan('dev');

// SPOTIFY API SETTINGS
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access stoken
spotifyApi
  .clientCredentialsGrant()
  .then(data => {
    spotifyApi.setAccessToken(data.body.access_token);
  })
  .catch(err =>
    console.error('Error while retrieving Spotify access token', err),
  );

// SET VIEW ENGINE
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// REGISTER PARTIALS
hbs.registerPartials(__dirname + '/views/partials');

// the routes go here:
app.get('/', (req, res, next) => {
  res.render('index');
});

// GET /artists
app.get('/artists', (req, res, next) => {
  spotifyApi
    .searchArtists(req.query.artist)
    .then(response => {
      // console.log(
      //   'The received response from the API',
      //   response.body.artists.items[0],
      // );

      const data = {
        artists: response.body.artists.items,
      };
      res.render('artists', data);
    })
    .catch(err =>
      console.error('Error during the searchArtists request.', err),
    );
});

// GET /albums
app.get('/albums/:artistId', (req, res, next) => {
  const { artistId } = req.params;
  spotifyApi
    .getArtistAlbums(artistId)
    .then(response => {
      const data = {
        albums: response.body.items,
        artistName: response.body.items[0].artists[0].name,
      };

      res.render('albums', data);
    })
    .catch(err => console.error(err));
});

app.get('/tracks/:albumId', (req, res, next) => {
  const { albumId } = req.params;
  spotifyApi
    .getAlbumTracks(albumId)
    .then(response => {
      // console.log('TRACKS', response.body.items);

      const data = {
        tracks: response.body.items,
      };

      res.render('tracks', data);
    })
    .catch(err => console.log(err));
});

app.listen(3000, () =>
  console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'),
);
