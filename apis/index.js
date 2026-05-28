const { nasaApod }       = require('./nasa');
const { restCountries }  = require('./countries');
const { openMeteo }      = require('./openMeteo');
const { openWeatherMap } = require('./openWeatherMap');
const { finnhub }        = require('./finnhub');
const { gitHub }         = require('./gitHub');
const { newsApi }        = require('./newsApi');

module.exports = { nasaApod, restCountries, openMeteo, openWeatherMap, finnhub, gitHub, newsApi };
