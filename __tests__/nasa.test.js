jest.mock('../restClient', () => {
    const actual = jest.requireActual('../restClient');
    return { ...actual, RestClient: jest.fn() };
});

const { RestClient } = require('../restClient');
const { nasaApod } = require('../apis/nasa');

describe('nasaApod', () => {
    let mockGet;

    beforeEach(() => {
        mockGet = jest.fn();
        RestClient.mockImplementation(() => ({ get: mockGet }));
    });

    const mockData = {
        title: 'Pillars of Creation',
        date: '2024-01-01',
        url: 'https://apod.nasa.gov/img.jpg',
        media_type: 'image',
        explanation: 'Iconic nebula pillars.',
    };

    it('returns formatted APOD data', async () => {
        mockGet.mockResolvedValue(mockData);
        const result = await nasaApod('MY_KEY');
        expect(result).toEqual({
            title: 'Pillars of Creation',
            date: '2024-01-01',
            url: 'https://apod.nasa.gov/img.jpg',
            mediaType: 'image',
            explanation: 'Iconic nebula pillars.',
        });
    });

    it('uses DEMO_KEY when no apiKey is provided', async () => {
        mockGet.mockResolvedValue(mockData);
        await nasaApod(undefined);
        expect(mockGet).toHaveBeenCalledWith('/planetary/apod', { api_key: 'DEMO_KEY' });
    });

    it('uses the provided apiKey', async () => {
        mockGet.mockResolvedValue(mockData);
        await nasaApod('REAL_KEY');
        expect(mockGet).toHaveBeenCalledWith('/planetary/apod', { api_key: 'REAL_KEY' });
    });

    it('constructs RestClient with NASA base URL', async () => {
        mockGet.mockResolvedValue(mockData);
        await nasaApod('KEY');
        expect(RestClient).toHaveBeenCalledWith('https://api.nasa.gov');
    });
});
