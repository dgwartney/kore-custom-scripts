jest.mock('../restClient', () => {
    const actual = jest.requireActual('../restClient');
    return { ...actual, RestClient: jest.fn() };
});

const { RestClient } = require('../restClient');
const { openWeatherMap } = require('../apis/openWeatherMap');

describe('openWeatherMap', () => {
    let mockGet;
    const originalEnv = process.env;

    beforeEach(() => {
        mockGet = jest.fn();
        RestClient.mockImplementation(() => ({ get: mockGet }));
        process.env = { ...originalEnv };
        delete process.env.OWM_API_KEY;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    const mockWeather = {
        name: 'London',
        weather: [{ description: 'overcast clouds' }],
        main: { temp: 15.0, feels_like: 13.0, humidity: 80 },
        wind: { speed: 5.0 },
    };

    it('returns formatted weather data', async () => {
        mockGet.mockResolvedValue(mockWeather);
        const result = await openWeatherMap('London', 'KEY');
        expect(result).toEqual({
            city: 'London',
            description: 'overcast clouds',
            temperature_c: 15.0,
            feels_like_c: 13.0,
            humidity_pct: 80,
            wind_speed_ms: 5.0,
        });
    });

    it('uses OWM_API_KEY env var when no apiKey param', async () => {
        process.env.OWM_API_KEY = 'ENV_KEY';
        mockGet.mockResolvedValue(mockWeather);
        await openWeatherMap('London', undefined);
        expect(mockGet).toHaveBeenCalledWith('/weather', { q: 'London', appid: 'ENV_KEY', units: 'metric' });
    });

    it('throws when no key is available', async () => {
        await expect(openWeatherMap('London', undefined)).rejects.toThrow('openWeatherMap requires OWM_API_KEY');
    });

    it('passes city and apiKey as query params', async () => {
        mockGet.mockResolvedValue(mockWeather);
        await openWeatherMap('Tokyo', 'MY_KEY');
        expect(mockGet).toHaveBeenCalledWith('/weather', { q: 'Tokyo', appid: 'MY_KEY', units: 'metric' });
    });

    it('constructs RestClient with OpenWeatherMap base URL', async () => {
        mockGet.mockResolvedValue(mockWeather);
        await openWeatherMap('London', 'KEY');
        expect(RestClient).toHaveBeenCalledWith('https://api.openweathermap.org/data/2.5');
    });
});
