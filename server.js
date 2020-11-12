'use strict';

const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL)


const PORT = process.env.PORT || 3000;

const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const HIKING_API_KEY = process.env.HIKING_API_KEY;

app.use(cors());

app.get('/location', handleLocation);

app.get('/weather', handleWeather);

app.get('/trails', handleTrails);

function handleLocation(req, res) {

  if (req.query.city !== '') {
    try {
      let city = req.query.city;
      let url = `http://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;
      let existingSQLData = 'SELECT * FROM cityLocation WHERE search_query = $1';


      client.query(existingSQLData, [city])
        .then(data => {
          if (data.rows.length > 0) {
            // console.log('cityLocationsDatabase')
            res.json(data.rows[0]);
          } else {
            // console.log('not saved yet');
            superagent.get(url)
              .then(data => {
                const geoData = data.body[0];
                const location = new Location(city, geoData);


                let SQL = 'INSERT INTO cityLocation (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *';
                let values = [city, geoData.display_name, geoData.lat, geoData.lon];
                client.query(SQL, values)
                  .then(() => {
                    res.json(location);
                  });
              });


          }
        })

    } catch (error) {
      console.error(error);
    }
  }
  else {
    res.status(500).send('Sorry, something went wrong');
  }

}

function handleWeather(req, res) {

  if (req.query.city !== '') {
    try {
      let cityLatitude = req.query.latitude;
      let cityLongitude = req.query.longitude;
      let url = `http://api.weatherbit.io/v2.0/forecast/daily?key=${WEATHER_API_KEY}&lat=${cityLatitude}&lon=${cityLongitude}&format=json&days=8`;
      let weather = {};

      if (weather[url]) {
        res.send(weather[url]);
      } else {
        superagent.get(url)
          .then(dataFromAPI => {
            const weatherData = dataFromAPI.body;
            let eachDayArray = weatherData.data.map(data => {
              return new Weather(data);
            });
            weather[url] = eachDayArray;

            res.json(eachDayArray);
          });
      }
    } catch (error) {
      console.error(error);
    }

  } else {
    res.status(500).send('Sorry, something went wrong');
  }

}

function handleTrails(req, res) {

  if (req.query.city !== '') {
    try {
      let cityLatitude = req.query.latitude;
      let cityLongitude = req.query.longitude;
      let url = `https://www.hikingproject.com/data/get-trails?key=${HIKING_API_KEY}&lat=${cityLatitude}&lon=${cityLongitude}&format=json`;

      let hiking = {};

      if (hiking[url]) {
        res.send(hiking[url]);
      } else {
        superagent.get(url)
          .then(dataFromAPI => {
            const hikeData = dataFromAPI.body;
            let eachHikeArray = hikeData.trails.map(data => {
              return new Hike(data);
            });
            hiking[url] = eachHikeArray;

            res.json(eachHikeArray);
          });
      }
    } catch (error) {
      console.error(error);
    }

  } else {
    res.status(500).send('Sorry, something went wrong');
  }
}


function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

function Weather(weatherData) {
  this.forecast = weatherData.weather.description;
  this.time = weatherData.valid_date;
}

function Hike(hikeData) {
  this.name = hikeData.name;
  this.location = hikeData.location;
  this.length = hikeData.length;
  this.stars = hikeData.stars;
  this.star_votes = hikeData.starVotes;
  this.summary = hikeData.summary;
  this.trail_url = hikeData.url;
  this.conditions = hikeData.conditionDetails;
  this.condition_date = hikeData.conditionDate;
  this.condition_time = hikeData.conditionDate;
}

app.use('*', (request, response) => {
  response.status(404).send('sorry, not found!');
});

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server up: ${PORT}`);
    });
  })
  .catch(err => console.log(err));

