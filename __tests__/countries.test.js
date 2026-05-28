jest.mock('../restClient', () => {
    const actual = jest.requireActual('../restClient');
    return { ...actual, RestClient: jest.fn() };
});

const { RestClient } = require('../restClient');
const { restCountries } = require('../apis/countries');

describe('restCountries', () => {
    let mockGet;

    beforeEach(() => {
        mockGet = jest.fn();
        RestClient.mockImplementation(() => ({ get: mockGet }));
    });

    it('returns formatted country data', async () => {
        mockGet.mockResolvedValue([{
            name: { common: 'Germany' },
            capital: ['Berlin'],
            population: 83000000,
            currencies: { EUR: { name: 'Euro' } },
            languages: { deu: 'German' },
        }]);

        const result = await restCountries('Germany');
        expect(result).toEqual({
            name: 'Germany',
            capital: 'Berlin',
            population: 83000000,
            currencies: ['Euro'],
            languages: ['German'],
        });
    });

    it('uses N/A when capital is missing', async () => {
        mockGet.mockResolvedValue([{
            name: { common: 'Nowhere' },
            capital: undefined,
            population: 1000,
            currencies: undefined,
            languages: undefined,
        }]);

        const result = await restCountries('Nowhere');
        expect(result.capital).toBe('N/A');
        expect(result.currencies).toEqual([]);
        expect(result.languages).toEqual([]);
    });

    it('handles multiple currencies', async () => {
        mockGet.mockResolvedValue([{
            name: { common: 'Cuba' },
            capital: ['Havana'],
            population: 11000000,
            currencies: { CUP: { name: 'Cuban Peso' }, CUC: { name: 'Cuban Convertible Peso' } },
            languages: { spa: 'Spanish' },
        }]);

        const result = await restCountries('Cuba');
        expect(result.currencies).toContain('Cuban Peso');
        expect(result.currencies).toContain('Cuban Convertible Peso');
    });

    it('constructs RestClient with correct base URL', async () => {
        mockGet.mockResolvedValue([{
            name: { common: 'France' },
            capital: ['Paris'],
            population: 67000000,
            currencies: { EUR: { name: 'Euro' } },
            languages: { fra: 'French' },
        }]);

        await restCountries('France');
        expect(RestClient).toHaveBeenCalledWith('https://restcountries.com/v3.1');
    });

    it('calls get with encoded country name and field filter', async () => {
        mockGet.mockResolvedValue([{
            name: { common: 'New Zealand' },
            capital: ['Wellington'],
            population: 5000000,
            currencies: { NZD: { name: 'New Zealand Dollar' } },
            languages: { eng: 'English', mri: 'Māori' },
        }]);

        await restCountries('New Zealand');
        expect(mockGet).toHaveBeenCalledWith(
            '/name/New%20Zealand',
            { fields: 'name,capital,population,currencies,languages' },
        );
    });
});
