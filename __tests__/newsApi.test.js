jest.mock('../restClient', () => {
    const actual = jest.requireActual('../restClient');
    return { ...actual, RestClient: jest.fn() };
});

const { RestClient } = require('../restClient');
const { newsApi } = require('../apis/newsApi');

describe('newsApi', () => {
    let mockGet, mockSetApiKey;
    const originalEnv = process.env;

    beforeEach(() => {
        mockGet = jest.fn();
        mockSetApiKey = jest.fn();
        RestClient.mockImplementation(() => ({ get: mockGet, setApiKey: mockSetApiKey }));
        process.env = { ...originalEnv };
        delete process.env.NEWS_API_KEY;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('returns formatted articles', async () => {
        mockGet.mockResolvedValue({
            articles: [
                { source: { name: 'BBC' }, title: 'AI News', url: 'https://bbc.com/ai', publishedAt: '2024-01-01T00:00:00Z' },
                { source: { name: 'Reuters' }, title: 'More AI', url: 'https://reuters.com/ai', publishedAt: '2024-01-02T00:00:00Z' },
            ],
        });
        const result = await newsApi('AI', 'KEY', 5);
        expect(result).toEqual([
            { source: 'BBC', title: 'AI News', url: 'https://bbc.com/ai', publishedAt: '2024-01-01T00:00:00Z' },
            { source: 'Reuters', title: 'More AI', url: 'https://reuters.com/ai', publishedAt: '2024-01-02T00:00:00Z' },
        ]);
    });

    it('uses NEWS_API_KEY env var when no apiKey param', async () => {
        process.env.NEWS_API_KEY = 'ENV_KEY';
        mockGet.mockResolvedValue({ articles: [] });
        await newsApi('AI', undefined, 5);
        expect(mockSetApiKey).toHaveBeenCalledWith('ENV_KEY', 'X-Api-Key');
    });

    it('throws when no key is available', async () => {
        await expect(newsApi('AI', undefined, 5)).rejects.toThrow('newsApi requires NEWS_API_KEY');
    });

    it('returns empty array when articles is undefined', async () => {
        mockGet.mockResolvedValue({});
        const result = await newsApi('AI', 'KEY', 5);
        expect(result).toEqual([]);
    });

    it('uses default pageSize of 5 when not provided', async () => {
        mockGet.mockResolvedValue({ articles: [] });
        await newsApi('tech', 'KEY', undefined);
        expect(mockGet).toHaveBeenCalledWith('/everything', {
            q: 'tech',
            pageSize: 5,
            sortBy: 'publishedAt',
        });
    });

    it('uses provided pageSize', async () => {
        mockGet.mockResolvedValue({ articles: [] });
        await newsApi('tech', 'KEY', 10);
        expect(mockGet).toHaveBeenCalledWith('/everything', {
            q: 'tech',
            pageSize: 10,
            sortBy: 'publishedAt',
        });
    });

    it('constructs RestClient with NewsAPI base URL', async () => {
        mockGet.mockResolvedValue({ articles: [] });
        await newsApi('AI', 'KEY', 5);
        expect(RestClient).toHaveBeenCalledWith('https://newsapi.org/v2');
    });
});
