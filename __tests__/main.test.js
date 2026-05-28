jest.mock('../apis/', () => ({
    nasaApod: jest.fn(),
    restCountries: jest.fn(),
    openMeteo: jest.fn(),
    openWeatherMap: jest.fn(),
    finnhub: jest.fn(),
    gitHub: jest.fn(),
    newsApi: jest.fn(),
}));

const apis = require('../apis/');
const main = require('../main');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('nasaApod', () => {
    it('passes apiKey through to apis.nasaApod', async () => {
        apis.nasaApod.mockResolvedValue({ title: 'APOD' });
        const result = await main.nasaApod('MY_KEY');
        expect(apis.nasaApod).toHaveBeenCalledWith('MY_KEY');
        expect(result).toEqual({ title: 'APOD' });
    });

    it('passes undefined when no key provided', async () => {
        apis.nasaApod.mockResolvedValue({ title: 'APOD' });
        await main.nasaApod();
        expect(apis.nasaApod).toHaveBeenCalledWith(undefined);
    });
});

describe('restCountries', () => {
    it('passes name through to apis.restCountries', async () => {
        apis.restCountries.mockResolvedValue({ name: 'France' });
        const result = await main.restCountries('France');
        expect(apis.restCountries).toHaveBeenCalledWith('France');
        expect(result).toEqual({ name: 'France' });
    });

    it('defaults to Germany when name is falsy', async () => {
        apis.restCountries.mockResolvedValue({ name: 'Germany' });
        await main.restCountries(undefined);
        expect(apis.restCountries).toHaveBeenCalledWith('Germany');
    });
});

describe('openMeteo', () => {
    it('passes latitude and longitude to apis.openMeteo', async () => {
        apis.openMeteo.mockResolvedValue({ temperature_c: 22 });
        const result = await main.openMeteo(48.8, 2.35);
        expect(apis.openMeteo).toHaveBeenCalledWith(48.8, 2.35);
        expect(result).toEqual({ temperature_c: 22 });
    });

    it('defaults to London coordinates (51.5, -0.12) when args are falsy', async () => {
        apis.openMeteo.mockResolvedValue({});
        await main.openMeteo(undefined, undefined);
        expect(apis.openMeteo).toHaveBeenCalledWith(51.5, -0.12);
    });
});

describe('openWeatherMap', () => {
    it('passes city and apiKey to apis.openWeatherMap', async () => {
        apis.openWeatherMap.mockResolvedValue({ city: 'Paris' });
        const result = await main.openWeatherMap('Paris', 'KEY');
        expect(apis.openWeatherMap).toHaveBeenCalledWith('Paris', 'KEY');
        expect(result).toEqual({ city: 'Paris' });
    });

    it('defaults to London when city is falsy', async () => {
        apis.openWeatherMap.mockResolvedValue({});
        await main.openWeatherMap(undefined, 'KEY');
        expect(apis.openWeatherMap).toHaveBeenCalledWith('London', 'KEY');
    });
});

describe('finnhub', () => {
    it('passes symbol and apiKey to apis.finnhub', async () => {
        apis.finnhub.mockResolvedValue({ symbol: 'TSLA' });
        const result = await main.finnhub('TSLA', 'KEY');
        expect(apis.finnhub).toHaveBeenCalledWith('TSLA', 'KEY');
        expect(result).toEqual({ symbol: 'TSLA' });
    });

    it('defaults to AAPL when symbol is falsy', async () => {
        apis.finnhub.mockResolvedValue({});
        await main.finnhub(undefined, 'KEY');
        expect(apis.finnhub).toHaveBeenCalledWith('AAPL', 'KEY');
    });
});

describe('gitHub', () => {
    it('passes repo and token to apis.gitHub', async () => {
        apis.gitHub.mockResolvedValue({ repo: 'facebook/react' });
        const result = await main.gitHub('facebook/react', 'TOKEN');
        expect(apis.gitHub).toHaveBeenCalledWith('facebook/react', 'TOKEN');
        expect(result).toEqual({ repo: 'facebook/react' });
    });

    it('defaults to python/cpython when repo is falsy', async () => {
        apis.gitHub.mockResolvedValue({});
        await main.gitHub(undefined, 'TOKEN');
        expect(apis.gitHub).toHaveBeenCalledWith('python/cpython', 'TOKEN');
    });
});

describe('newsApi', () => {
    it('passes topic, apiKey, and pageSize to apis.newsApi', async () => {
        apis.newsApi.mockResolvedValue([{ title: 'News' }]);
        const result = await main.newsApi('tech', 'KEY', 10);
        expect(apis.newsApi).toHaveBeenCalledWith('tech', 'KEY', 10);
        expect(result).toEqual([{ title: 'News' }]);
    });

    it('defaults to "artificial intelligence" when topic is falsy', async () => {
        apis.newsApi.mockResolvedValue([]);
        await main.newsApi(undefined, 'KEY', 5);
        expect(apis.newsApi).toHaveBeenCalledWith('artificial intelligence', 'KEY', 5);
    });
});

describe('exports', () => {
    it('exports RestClientError', () => {
        const { RestClientError } = require('../main');
        expect(typeof RestClientError).toBe('function');
        const err = new RestClientError(404, 'Not Found', '');
        expect(err.statusCode).toBe(404);
    });
});
