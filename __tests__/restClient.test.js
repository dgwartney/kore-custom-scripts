const { RestClient, RestClientError } = require('../restClient');

describe('RestClientError', () => {
    it('sets message, statusCode, reason, and body', () => {
        const err = new RestClientError(404, 'Not Found', '{"error":"missing"}');
        expect(err.message).toBe('HTTP 404: Not Found');
        expect(err.statusCode).toBe(404);
        expect(err.reason).toBe('Not Found');
        expect(err.body).toBe('{"error":"missing"}');
        expect(err).toBeInstanceOf(Error);
    });

    it('is an instance of Error', () => {
        const err = new RestClientError(500, 'Server Error', '');
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(RestClientError);
    });
});

describe('RestClient', () => {
    let client;

    beforeEach(() => {
        global.fetch = jest.fn();
        client = new RestClient('https://api.example.com');
    });

    describe('constructor', () => {
        it('strips trailing slash from baseUrl', () => {
            const c = new RestClient('https://api.example.com/');
            expect(c.baseUrl).toBe('https://api.example.com');
        });

        it('keeps baseUrl without trailing slash unchanged', () => {
            expect(client.baseUrl).toBe('https://api.example.com');
        });

        it('includes default Content-Type and Accept headers', () => {
            expect(client.defaultHeaders['Content-Type']).toBe('application/json');
            expect(client.defaultHeaders['Accept']).toBe('application/json');
        });

        it('merges custom headers with defaults', () => {
            const c = new RestClient('https://api.example.com', { 'X-Custom': 'value' });
            expect(c.defaultHeaders['X-Custom']).toBe('value');
            expect(c.defaultHeaders['Content-Type']).toBe('application/json');
        });

        it('uses default timeout of 30000', () => {
            expect(client.timeout).toBe(30000);
        });

        it('accepts a custom timeout', () => {
            const c = new RestClient('https://api.example.com', {}, 5000);
            expect(c.timeout).toBe(5000);
        });
    });

    describe('_buildUrl', () => {
        it('builds URL without params', () => {
            expect(client._buildUrl('/foo')).toBe('https://api.example.com/foo');
        });

        it('strips leading slash from path', () => {
            expect(client._buildUrl('/foo')).toBe('https://api.example.com/foo');
        });

        it('builds URL with query params', () => {
            const url = client._buildUrl('/search', { q: 'test', page: '1' });
            expect(url).toContain('https://api.example.com/search?');
            expect(url).toContain('q=test');
            expect(url).toContain('page=1');
        });

        it('returns plain URL when params is an empty object', () => {
            expect(client._buildUrl('/foo', {})).toBe('https://api.example.com/foo');
        });

        it('returns plain URL when params is null', () => {
            expect(client._buildUrl('/foo', null)).toBe('https://api.example.com/foo');
        });

        it('returns plain URL when params is undefined', () => {
            expect(client._buildUrl('/foo', undefined)).toBe('https://api.example.com/foo');
        });
    });

    describe('_request', () => {
        const makeResponse = (ok, status, statusText, body) => ({
            ok,
            status,
            statusText,
            text: jest.fn().mockResolvedValue(body),
        });

        it('makes a successful GET and parses JSON', async () => {
            global.fetch.mockResolvedValue(makeResponse(true, 200, 'OK', '{"data":1}'));
            const result = await client._request('GET', '/test');
            expect(result).toEqual({ data: 1 });
        });

        it('passes body as JSON string in POST', async () => {
            global.fetch.mockResolvedValue(makeResponse(true, 200, 'OK', '{"ok":true}'));
            await client._request('POST', '/test', { body: { name: 'test' } });
            const [, options] = global.fetch.mock.calls[0];
            expect(options.body).toBe(JSON.stringify({ name: 'test' }));
            expect(options.method).toBe('POST');
        });

        it('does not set body when body is undefined', async () => {
            global.fetch.mockResolvedValue(makeResponse(true, 200, 'OK', '{}'));
            await client._request('GET', '/test');
            const [, options] = global.fetch.mock.calls[0];
            expect(options.body).toBeUndefined();
        });

        it('merges per-request headers with defaults', async () => {
            global.fetch.mockResolvedValue(makeResponse(true, 200, 'OK', '{}'));
            await client._request('GET', '/test', { headers: { 'X-Extra': 'yes' } });
            const [, options] = global.fetch.mock.calls[0];
            expect(options.headers['X-Extra']).toBe('yes');
            expect(options.headers['Content-Type']).toBe('application/json');
        });

        it('returns null when response body is empty', async () => {
            global.fetch.mockResolvedValue(makeResponse(true, 204, 'No Content', ''));
            const result = await client._request('DELETE', '/test');
            expect(result).toBeNull();
        });

        it('throws RestClientError on non-ok response', async () => {
            global.fetch.mockResolvedValue(makeResponse(false, 404, 'Not Found', 'not found'));
            await expect(client._request('GET', '/missing')).rejects.toThrow(RestClientError);
        });

        it('includes status, reason, and body on HTTP error', async () => {
            global.fetch.mockResolvedValue(makeResponse(false, 500, 'Server Error', 'oops'));
            let caught;
            try {
                await client._request('GET', '/fail');
            } catch (err) {
                caught = err;
            }
            expect(caught.statusCode).toBe(500);
            expect(caught.reason).toBe('Server Error');
            expect(caught.body).toBe('oops');
        });

        it('throws RestClientError on network failure', async () => {
            global.fetch.mockRejectedValue(new Error('network failure'));
            await expect(client._request('GET', '/test')).rejects.toThrow(RestClientError);
        });

        it('wraps network error with statusCode 0', async () => {
            global.fetch.mockRejectedValue(new Error('timeout'));
            let caught;
            try {
                await client._request('GET', '/test');
            } catch (err) {
                caught = err;
            }
            expect(caught.statusCode).toBe(0);
            expect(caught.reason).toBe('timeout');
            expect(caught.body).toBe('');
        });

        it('passes query params via _buildUrl', async () => {
            global.fetch.mockResolvedValue(makeResponse(true, 200, 'OK', '{}'));
            await client._request('GET', '/search', { params: { q: 'test' } });
            const [url] = global.fetch.mock.calls[0];
            expect(url).toContain('q=test');
        });
    });

    describe('HTTP method shortcuts', () => {
        beforeEach(() => {
            jest.spyOn(client, '_request').mockResolvedValue({});
        });

        it('get calls _request with GET and params', async () => {
            await client.get('/path', { p: 1 });
            expect(client._request).toHaveBeenCalledWith('GET', '/path', { params: { p: 1 } });
        });

        it('post calls _request with POST and body', async () => {
            await client.post('/path', { data: 1 });
            expect(client._request).toHaveBeenCalledWith('POST', '/path', { body: { data: 1 } });
        });

        it('put calls _request with PUT and body', async () => {
            await client.put('/path', { data: 1 });
            expect(client._request).toHaveBeenCalledWith('PUT', '/path', { body: { data: 1 } });
        });

        it('patch calls _request with PATCH and body', async () => {
            await client.patch('/path', { data: 1 });
            expect(client._request).toHaveBeenCalledWith('PATCH', '/path', { body: { data: 1 } });
        });

        it('delete calls _request with DELETE', async () => {
            await client.delete('/path');
            expect(client._request).toHaveBeenCalledWith('DELETE', '/path', {});
        });

        it('get passes extra opts through', async () => {
            await client.get('/path', { p: 1 }, { headers: { 'X-H': '1' } });
            expect(client._request).toHaveBeenCalledWith('GET', '/path', { params: { p: 1 }, headers: { 'X-H': '1' } });
        });

        it('post passes extra opts through', async () => {
            await client.post('/path', { d: 1 }, { headers: { 'X-H': '1' } });
            expect(client._request).toHaveBeenCalledWith('POST', '/path', { body: { d: 1 }, headers: { 'X-H': '1' } });
        });
    });

    describe('auth helpers', () => {
        it('setAuthToken sets Authorization Bearer header', () => {
            client.setAuthToken('mytoken');
            expect(client.defaultHeaders['Authorization']).toBe('Bearer mytoken');
        });

        it('setApiKey uses default X-API-Key header', () => {
            client.setApiKey('mykey');
            expect(client.defaultHeaders['X-API-Key']).toBe('mykey');
        });

        it('setApiKey uses a custom header name', () => {
            client.setApiKey('mykey', 'X-Custom-Key');
            expect(client.defaultHeaders['X-Custom-Key']).toBe('mykey');
        });
    });
});
