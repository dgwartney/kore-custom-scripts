jest.mock('../restClient', () => {
    const actual = jest.requireActual('../restClient');
    return { ...actual, RestClient: jest.fn() };
});

const { RestClient } = require('../restClient');
const { finnhub } = require('../apis/finnhub');

describe('finnhub', () => {
    let mockGet, mockSetApiKey;
    const originalEnv = process.env;

    beforeEach(() => {
        mockGet = jest.fn();
        mockSetApiKey = jest.fn();
        RestClient.mockImplementation(() => ({ get: mockGet, setApiKey: mockSetApiKey }));
        process.env = { ...originalEnv };
        delete process.env.FINNHUB_API_KEY;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    const mockQuote = { c: 150.0, dp: 1.5, h: 155.0, l: 148.0, o: 149.0, pc: 148.5 };

    it('returns formatted quote data', async () => {
        mockGet.mockResolvedValue(mockQuote);
        const result = await finnhub('AAPL', 'MY_KEY');
        expect(result).toEqual({
            symbol: 'AAPL',
            currentPrice: 150.0,
            changePercent: 1.5,
            high: 155.0,
            low: 148.0,
            open: 149.0,
            previousClose: 148.5,
        });
    });

    it('uses env var FINNHUB_API_KEY when no apiKey param', async () => {
        process.env.FINNHUB_API_KEY = 'ENV_KEY';
        mockGet.mockResolvedValue(mockQuote);
        await finnhub('TSLA', undefined);
        expect(mockSetApiKey).toHaveBeenCalledWith('ENV_KEY', 'X-Finnhub-Token');
    });

    it('throws when no key is available', async () => {
        await expect(finnhub('AAPL', undefined)).rejects.toThrow('finnhub requires FINNHUB_API_KEY');
    });

    it('sets the API key on the client', async () => {
        mockGet.mockResolvedValue(mockQuote);
        await finnhub('AAPL', 'KEY123');
        expect(mockSetApiKey).toHaveBeenCalledWith('KEY123', 'X-Finnhub-Token');
    });

    it('calls get with correct symbol param', async () => {
        mockGet.mockResolvedValue(mockQuote);
        await finnhub('MSFT', 'KEY');
        expect(mockGet).toHaveBeenCalledWith('/quote', { symbol: 'MSFT' });
    });

    it('constructs RestClient with Finnhub base URL', async () => {
        mockGet.mockResolvedValue(mockQuote);
        await finnhub('AAPL', 'KEY');
        expect(RestClient).toHaveBeenCalledWith('https://finnhub.io/api/v1');
    });
});
