class RestClientError extends Error {
    constructor(statusCode, reason, body) {
        super(`HTTP ${statusCode}: ${reason}`);
        this.statusCode = statusCode;
        this.reason = reason;
        this.body = body;
    }
}

class RestClient {
    constructor(baseUrl, headers = {}, timeout = 30000) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...headers,
        };
        this.timeout = timeout;
    }

    _buildUrl(path, params) {
        const url = `${this.baseUrl}/${path.replace(/^\//, '')}`;
        if (!params || Object.keys(params).length === 0) return url;
        return `${url}?${new URLSearchParams(params).toString()}`;
    }

    async _request(method, path, { params, body, headers } = {}) {
        const url = this._buildUrl(path, params);
        const mergedHeaders = { ...this.defaultHeaders, ...headers };
        const options = { method, headers: mergedHeaders, signal: AbortSignal.timeout(this.timeout) };
        if (body !== undefined) options.body = JSON.stringify(body);

        let response;
        try {
            response = await fetch(url, options);
        } catch (err) {
            throw new RestClientError(0, err.message, '');
        }

        const raw = await response.text();
        if (!response.ok) {
            throw new RestClientError(response.status, response.statusText, raw);
        }
        return raw ? JSON.parse(raw) : null;
    }

    get(path, params, opts = {})  { return this._request('GET',    path, { params, ...opts }); }
    post(path, body, opts = {})   { return this._request('POST',   path, { body,   ...opts }); }
    put(path, body, opts = {})    { return this._request('PUT',    path, { body,   ...opts }); }
    patch(path, body, opts = {})  { return this._request('PATCH',  path, { body,   ...opts }); }
    delete(path, opts = {})       { return this._request('DELETE', path, opts);                }

    setAuthToken(token)                   { this.defaultHeaders['Authorization'] = `Bearer ${token}`; }
    setApiKey(key, header = 'X-API-Key')  { this.defaultHeaders[header] = key; }
}

module.exports = { RestClient, RestClientError };
