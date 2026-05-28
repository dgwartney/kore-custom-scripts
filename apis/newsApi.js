const { RestClient } = require('../restClient');

async function newsApi(topic, apiKey, pageSize) {
    const key = apiKey || process.env.NEWS_API_KEY;
    if (!key) throw new Error('newsApi requires NEWS_API_KEY');
    const client = new RestClient('https://newsapi.org/v2');
    client.setApiKey(key, 'X-Api-Key');
    const data = await client.get('/everything', {
        q:        topic,
        pageSize: pageSize || 5,
        sortBy:   'publishedAt',
    });
    return (data.articles ?? []).map((article) => ({
        source:      article.source.name,
        title:       article.title,
        url:         article.url,
        publishedAt: article.publishedAt,
    }));
}

module.exports = { newsApi };
