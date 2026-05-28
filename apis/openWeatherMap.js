const { RestClient } = require('../restClient');

async function openWeatherMap(city, apiKey) {
    const key = apiKey || process.env.OWM_API_KEY;
    if (!key) throw new Error('openWeatherMap requires OWM_API_KEY');
    const client = new RestClient('https://api.openweathermap.org/data/2.5');
    const data = await client.get('/weather', { q: city, appid: key, units: 'metric' });
    return {
        city:           data.name,
        description:    data.weather[0].description,
        temperature_c:  data.main.temp,
        feels_like_c:   data.main.feels_like,
        humidity_pct:   data.main.humidity,
        wind_speed_ms:  data.wind.speed,
    };
}

module.exports = { openWeatherMap };
