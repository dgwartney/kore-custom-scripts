jest.mock('../restClient', () => {
    const actual = jest.requireActual('../restClient');
    return { ...actual, RestClient: jest.fn() };
});

const { RestClient } = require('../restClient');
const { gitHub } = require('../apis/gitHub');

describe('gitHub', () => {
    let mockGet, mockSetAuthToken;
    const originalEnv = process.env;

    beforeEach(() => {
        mockGet = jest.fn();
        mockSetAuthToken = jest.fn();
        RestClient.mockImplementation(() => ({ get: mockGet, setAuthToken: mockSetAuthToken }));
        process.env = { ...originalEnv };
        delete process.env.GITHUB_TOKEN;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    const mockRepo = {
        description: 'The Python programming language',
        stargazers_count: 50000,
        forks_count: 25000,
        open_issues_count: 1000,
        language: 'Python',
        html_url: 'https://github.com/python/cpython',
    };

    it('returns formatted repository data', async () => {
        mockGet.mockResolvedValue(mockRepo);
        const result = await gitHub('python/cpython', 'TOKEN');
        expect(result).toEqual({
            repo: 'python/cpython',
            description: 'The Python programming language',
            stars: 50000,
            forks: 25000,
            openIssues: 1000,
            language: 'Python',
            url: 'https://github.com/python/cpython',
        });
    });

    it('uses GITHUB_TOKEN env var when no token param', async () => {
        process.env.GITHUB_TOKEN = 'ENV_TOKEN';
        mockGet.mockResolvedValue(mockRepo);
        await gitHub('python/cpython', undefined);
        expect(mockSetAuthToken).toHaveBeenCalledWith('ENV_TOKEN');
    });

    it('throws when no token is available', async () => {
        await expect(gitHub('python/cpython', undefined)).rejects.toThrow('gitHub requires GITHUB_TOKEN');
    });

    it('calls get with the correct repo path', async () => {
        mockGet.mockResolvedValue(mockRepo);
        await gitHub('nodejs/node', 'TOKEN');
        expect(mockGet).toHaveBeenCalledWith('/repos/nodejs/node');
    });

    it('sets auth token on the client', async () => {
        mockGet.mockResolvedValue(mockRepo);
        await gitHub('python/cpython', 'MY_TOKEN');
        expect(mockSetAuthToken).toHaveBeenCalledWith('MY_TOKEN');
    });

    it('constructs RestClient with GitHub base URL', async () => {
        mockGet.mockResolvedValue(mockRepo);
        await gitHub('python/cpython', 'TOKEN');
        expect(RestClient).toHaveBeenCalledWith('https://api.github.com');
    });
});
