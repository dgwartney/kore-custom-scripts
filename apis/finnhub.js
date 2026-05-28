const { RestClient } = require('../restClient');

async function finnhub(symbol, apiKey) {
    const key = apiKey || process.env.FINNHUB_API_KEY;
    if (!key) throw new Error('finnhub requires FINNHUB_API_KEY');
    const client = new RestClient('https://finnhub.io/api/v1');
    client.setApiKey(key, 'X-Finnhub-Token');
    const quote = await client.get('/quote', { symbol });
    return {
        symbol,
        currentPrice:   quote.c,
        changePercent:  quote.dp,
        high:           quote.h,
        low:            quote.l,
        open:           quote.o,
        previousClose:  quote.pc,
    };
}

module.exports = { finnhub };
