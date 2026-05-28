const { RestClient } = require('../restClient');

async function restCountries(name) {
    const client = new RestClient('https://restcountries.com/v3.1');
    const results = await client.get(`/name/${encodeURIComponent(name)}`, {
        fields: 'name,capital,population,currencies,languages',
    });
    const country = results[0];
    return {
        name:       country.name.common,
        capital:    (country.capital ?? ['N/A'])[0],
        population: country.population,
        currencies: Object.values(country.currencies ?? {}).map((c) => c.name),
        languages:  Object.values(country.languages ?? {}),
    };
}

module.exports = { restCountries };
