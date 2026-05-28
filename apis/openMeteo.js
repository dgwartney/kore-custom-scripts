const { RestClient } = require('../restClient');

async function openMeteo(latitude, longitude) {
    const client = new RestClient('https://api.open-meteo.com/v1');
    const data = await client.get('/forecast', {
        latitude,
        longitude,
        current:         'temperature_2m,wind_speed_10m,weather_code',
        wind_speed_unit: 'mph',
    });
    const current = data.current;
    return {
        latitude,
        longitude,
        temperature_c:   current.temperature_2m,
        wind_speed_mph:  current.wind_speed_10m,
        weather_code:    current.weather_code,
        time:            current.time,
    };
}

module.exports = { openMeteo };
