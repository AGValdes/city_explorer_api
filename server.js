'use strict';

const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

const PORT = process.env.PORT || 3000;

const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
// const HIKING_API_KEY = process.env.HIKING_API_KEY;

app.use(cors());

app.get('/location', handleLocation);

app.get('/weather', handleWeather);

function handleLocation(req, res) {

  if (req.query.city !== ''){
    try {
      let city = req.query.city;
      let url = `http://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;
      let locations = {};

      if (locations[url]){
        res.send(locations[url]);
      } else {
        superagent.get(url)
          .then (data => {
            const geoData = data.body[0];
            const location = new Location (city, geoData);
            locations[url]=location;

            res.json(location);
          })
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    res.status(500).send('Sorry, something went wrong');
  }

}

function handleWeather(req, res) {
  console.log('req.query', req.query);
  if (req.query.city !== ''){
    try {
      let cityLatitude= req.query.latitude;
      let cityLongitude= req.query.longitude;
      let url = `http://api.weatherbit.io/v2.0/forecast/daily?key=${WEATHER_API_KEY}&lat=${cityLatitude}&lon=${cityLongitude}&format=json&days=8`;
      let weather = {};

      if (weather[url]){
        res.send(weather[url]);
      } else {
        superagent.get(url)
          .then (dataFromAPI => {
            const weatherData = dataFromAPI.body;
            let eachDayArray = weatherData.data.map( data =>{
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

app.use('*', (request, response) => {
  response.status(404).send('sorry, not found!');
});

app.listen(PORT, () => {
  console.log(`server up: ${PORT}`);
});

