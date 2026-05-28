const { RestClient } = require('../restClient');

async function nasaApod(apiKey) {
    const client = new RestClient('https://api.nasa.gov');
    const data = await client.get('/planetary/apod', { api_key: apiKey || 'DEMO_KEY' });
    return {
        title:      data.title,
        date:       data.date,
        url:        data.url,
        mediaType:  data.media_type,
        explanation: data.explanation,
    };
}

module.exports = { nasaApod };
