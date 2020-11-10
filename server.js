'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/location', handleLocation);

app.get('/weather', handleWeather);

function handleLocation(request, response) {

  if (request.query.city !== ''){
    try {
      let geoData = require('./data/location.json');
      var city = request.query.city;
      let locationData = new Location(city, geoData);
      response.send(locationData);
    } catch (error) {
      console.error(error);
    }
  } else {
    response.status(500).send('Sorry, something went wrong');
  }

}

function handleWeather(request, response) {

  if (request.query.city !== ''){
    try {
      let weatherData = require('./data/weather.json');
      let cityWeather = request.query.cityWeather;

      let eachDayArray = weatherData.data.map( data =>{
        return new Weather(cityWeather, data);
      })
      response.send(eachDayArray);
    } catch (error) {
      console.error(error);
    }
  }else {
    response.status(500).send('Sorry, something went wrong');
  }

}



function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

function Weather(cityWeather, weatherData) {
  this.search_query = cityWeather;
  this.forecast = weatherData.weather.description;
  this.time = weatherData.valid_date;
}

app.use('*', (request, response) => {
  response.status(404).send('sorry, not found!');
});

app.listen(PORT, () => {
  console.log(`server up: ${PORT}`);
});

