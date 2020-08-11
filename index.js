require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const geoData = require('./data/geo.js');
const weatherData = require('./data/weather.js');
const port = process.env.PORT || 3000;

app.use(cors());

function getLatLong(cityName) {
    //change to api call here
    const city = geoData[0];

    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitude: city.lon,
    }
}

function getWeather(lat, long) {
    //change to api call here
    const data = weatherData.data;
    const forecastArray = data.map((weatherItem) => {
        return {
            forecast: weatherItem.weather.description,
            time: new Date(weatherItem.ts * 1000),
        }
    });

    return forecastArray;
}

app.get('/location', (req, res) => {
    try {
        const userInput = req.query.search;
        const response = getLatLong(userInput)

        res.json(response)
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
})

app.get('/weather', (req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLong = req.query.longitude
        const response = getWeather(userLat, userLong)
        res.json(response)
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})