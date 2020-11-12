DROP TABLE IF EXISTS cityLocation;
DROP TABLE IF EXISTS weather;
DROP TABLE IF EXISTS hikes;

CREATE TABLE cityLocation (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude FLOAT,
  longitude FLOAT
);

CREATE TABLE weather(
  id SERIAL PRIMARY KEY,
  forecast VARCHAR(255),
  forecastDay DATE
);

CREATE TABLE hikes(
  id SERIAL PRIMARY KEY,
  nameOfHike VARCHAR(255),
  locationOfHike VARCHAR(255),
  lengthOfHike FLOAT,
  stars FLOAT,
  starVotes INTEGER,
  summary TEXT,
  trailUrl  VARCHAR(255),
  conditions TEXT,
  conditionDate  DATE,
  conditionTime DATE
);