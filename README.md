# public-apis-kore

A collection of public API integrations packaged as a Kore AI App Functions custom script. Each function in `main.js` is exposed as an API endpoint or tool integration on the Kore platform.

## Exposed functions

| Function | Description | Required env var |
|---|---|---|
| `nasaApod(apiKey)` | NASA Astronomy Picture of the Day | `NASA_API_KEY` (or pass directly) |
| `restCountries(name)` | Country data lookup by name (default: `Germany`) | — |
| `openMeteo(latitude, longitude)` | Weather forecast by coordinates (default: London) | — |
| `openWeatherMap(city, apiKey)` | Current weather by city name (default: `London`) | `OWM_API_KEY` |
| `finnhub(symbol, apiKey)` | Stock quote by ticker symbol (default: `AAPL`) | `FINNHUB_API_KEY` |
| `gitHub(repo, token)` | GitHub repository metadata (default: `python/cpython`) | `GITHUB_TOKEN` |
| `newsApi(topic, apiKey, pageSize)` | News headlines by topic (default: `artificial intelligence`) | `NEWS_API_KEY` |

## Project structure

```
.
├── main.js          # Entrypoint — all exposed functions live here
├── restClient.js    # Shared HTTP client (RestClient, RestClientError)
├── apis/
│   ├── index.js     # Re-exports all API modules
│   ├── countries.js
│   ├── finnhub.js
│   ├── gitHub.js
│   ├── nasa.js
│   ├── newsApi.js
│   ├── openMeteo.js
│   └── openWeatherMap.js
├── package.json     # Dependencies and test config
└── .env.example     # Template for required environment variables
```

## Kore platform requirements

### Entrypoint

`main.js` is the required entrypoint. Only functions exported from this file are callable as API endpoints or tool integrations. Helper logic lives in `apis/` and `restClient.js`, imported via relative paths.

### Dependencies

External dependencies are declared in `package.json`. The platform installs them automatically — no manual `npm install` step is needed after upload.

### Relative imports

All internal imports use relative paths, as required by the platform:

```js
const apis = require('./apis/');
const { RestClientError } = require('./restClient');
```

### Environment variables

API keys are read from environment variables at runtime. Configure these in the Kore platform's environment settings (not committed to source):

```js
// Access pattern used in this project
process.env.OWM_API_KEY
process.env.FINNHUB_API_KEY
process.env.GITHUB_TOKEN
process.env.NEWS_API_KEY
```

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
# Fill in your keys, then source the file
source .env
```

### Logging

This project uses `console.log` / `console.error` for stdout logging. To use structured logging instead, replace these calls with the `korelogger` library (available in the platform runtime):

```js
const logger = require('korelogger');
logger.info('message');
logger.debug('detail', { key: 'value' });
logger.error('something failed', err);
```

## Local development

```bash
npm install
npm test            # run tests with coverage
npm run test:coverage
```

Requires Node.js >= 18.

## Build

The `Makefile` wraps common tasks:

| Target | Description |
|---|---|
| `make` / `make all` | Build `apis.zip` — the deployment artifact |
| `make test` | Run the test suite via `npm test` |
| `make clean` | Remove `apis.zip` and the `coverage/` directory |

`apis.zip` bundles `main.js`, `restClient.js`, `apis/`, and `package.json` — everything the Kore platform needs to run the custom script.

## Calling the API

`call-api.sh` is a convenience script for testing deployed functions against the Kore Agent Platform endpoint.

```bash
bash call-api.sh
```

The script sources `.env` if it exists, then sends a `curl` POST to the serverless endpoint. Edit the `function_name` and `args` fields in the script body to target a different function.

### API_KEY environment variable

The script authenticates with a Bearer token read from `API_KEY`. Set it before running:

```bash
# Option 1 — inline
API_KEY=your_token bash call-api.sh

# Option 2 — export in your shell
export API_KEY=your_token
bash call-api.sh

# Option 3 — add to .env (auto-sourced by the script)
echo "export API_KEY=your_token" >> .env
bash call-api.sh
```

`API_KEY` is your Kore platform API token, separate from the third-party API keys (`NASA_API_KEY`, `OWM_API_KEY`, etc.) used by the individual functions.
