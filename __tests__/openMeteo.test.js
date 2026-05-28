jest.mock('../restClient', () => {
    const actual = jest.requireActual('../restClient');
    return { ...actual, RestClient: jest.fn() };
});

const { RestClient } = require('../restClient');
const { openMeteo } = require('../apis/openMeteo');

describe('openMeteo', () => {
    let mockGet;

    beforeEach(() => {
        mockGet = jest.fn();
        RestClient.mockImplementation(() => ({ get: mockGet }));
    });

    it('returns formatted current weather data', async () => {
        mockGet.mockResolvedValue({
            current: {
                temperature_2m: 20.5,
                wind_speed_10m: 10.2,
                weather_code: 3,
                time: '2024-01-01T12:00',
            },
        });

        const result = await openMeteo(51.5, -0.12);
        expect(result).toEqual({
            latitude: 51.5,
            longitude: -0.12,
            temperature_c: 20.5,
            wind_speed_mph: 10.2,
            weather_code: 3,
            time: '2024-01-01T12:00',
        });
    });

    it('passes correct params to get', async () => {
        mockGet.mockResolvedValue({
            current: { temperature_2m: 0, wind_speed_10m: 0, weather_code: 0, time: '' },
        });
        await openMeteo(40.7, -74.0);
        expect(mockGet).toHaveBeenCalledWith('/forecast', {
            latitude: 40.7,
            longitude: -74.0,
            current: 'temperature_2m,wind_speed_10m,weather_code',
            wind_speed_unit: 'mph',
        });
    });

    it('constructs RestClient with Open-Meteo base URL', async () => {
        mockGet.mockResolvedValue({
            current: { temperature_2m: 0, wind_speed_10m: 0, weather_code: 0, time: '' },
        });
        await openMeteo(0, 0);
        expect(RestClient).toHaveBeenCalledWith('https://api.open-meteo.com/v1');
    });
});
