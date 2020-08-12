require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const request = require('superagent');

app.use(cors());

//imports protected info from env file
const {
    LOCATION_KEY,
    WEATHER_KEY,
    HIKING_KEY,
    YELP_KEY,
} = process.env;

async function getLatLong(cityName) {
    //calls to the api adding the information needed from the api's web site
    const response = await request.get(`https://us1.locationiq.com/v1/search.php?key=${LOCATION_KEY}&q=${cityName}&format=json`);

    //decides which city out of list to list info for/munges data
    const city = response.body[0];

    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitude: city.lon,
    }
}

async function getWeather(lat, long) {
    //change to api call here
    const response = await request.get(`https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${long}&key=${WEATHER_KEY}`);

    const forecastData = response.body.data.slice(0, 8);
    const forecastArray = forecastData.map((weatherItem) => {
        return {
            forecast: weatherItem.weather.description,
            time: new Date(weatherItem.ts * 1000),
        };
    });

    return forecastArray;
}

async function getTrails(lat, long) {
    const trailData = await request.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${long}&key=${HIKING_KEY}`)

    const mungedTrailData = trailData.body.trails;
    return mungedTrailData;
}

async function getReviews(lat, long) {
    const reviewData = await request.get(`https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${long}`).set('Authorization', `Bearer ${YELP_KEY}`);

    const mungedReviewlData = reviewData.body.businesses.map((review) => {
        return {
            "name": review.name,
            "image_url": review.image_url,
            "price": review.price,
            "rating": review.rating,
            "url": review.url,
        }
    });

    return mungedReviewlData;
}

app.get('/location', async(req, res) => {
    try {
        const userInput = req.query.search;
        const response = await getLatLong(userInput)

        res.json(response)
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
})

app.get('/weather', async(req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLong = req.query.longitude;
        const response = await getWeather(userLat, userLong)
        res.json(response)
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
})

app.get('/trails', async(req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLong = req.query.longitude;
        const response = await getTrails(userLat, userLong)
        res.json(response)
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
})

app.get('/reviews', async(req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLong = req.query.longitude;
        const response = await getReviews(userLat, userLong)
        res.json(response)
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
})

app.get('/events', async(req, res) => {
    try {
        res.json([{
            link: 'www.gohere.com',
            name: 'Patricks Cool Event',
            event_date: '8/31/2020',
            summary: 'Cool Virtural Event!',
        }]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})