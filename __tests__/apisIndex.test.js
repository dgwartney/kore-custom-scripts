const apis = require('../apis/');

describe('apis/index', () => {
    it('exports all expected API functions', () => {
        expect(typeof apis.nasaApod).toBe('function');
        expect(typeof apis.restCountries).toBe('function');
        expect(typeof apis.openMeteo).toBe('function');
        expect(typeof apis.openWeatherMap).toBe('function');
        expect(typeof apis.finnhub).toBe('function');
        expect(typeof apis.gitHub).toBe('function');
        expect(typeof apis.newsApi).toBe('function');
    });
});
