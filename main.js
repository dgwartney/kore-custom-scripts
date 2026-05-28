const apis = require('./apis/');
const _ = require('lodash');
const { RestClientError } = require('./restClient');

async function nasaApod(apiKey) {
    return apis.nasaApod(apiKey);
}

async function restCountries(name) {
    return apis.restCountries(name || 'Germany');
}

async function openMeteo(latitude, longitude) {
    return apis.openMeteo(latitude || 51.5, longitude || -0.12);
}

async function openWeatherMap(city, apiKey) {
    return apis.openWeatherMap(city || 'London', apiKey);
}

async function finnhub(symbol, apiKey) {
    return apis.finnhub(symbol || 'AAPL', apiKey);
}

async function gitHub(repo, token) {
    return apis.gitHub(repo || 'python/cpython', token);
}

async function newsApi(topic, apiKey, pageSize) {
    return apis.newsApi(topic || 'artificial intelligence', apiKey, pageSize);
}

module.exports = { nasaApod, restCountries, openMeteo, openWeatherMap, finnhub, gitHub, newsApi, RestClientError };
