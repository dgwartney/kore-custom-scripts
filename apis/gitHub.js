const { RestClient } = require('../restClient');

async function gitHub(repo, token) {
    const tok = token || process.env.GITHUB_TOKEN;
    if (!tok) throw new Error('gitHub requires GITHUB_TOKEN');
    const client = new RestClient('https://api.github.com');
    client.setAuthToken(tok);
    const data = await client.get(`/repos/${repo}`);
    return {
        repo,
        description: data.description,
        stars:       data.stargazers_count,
        forks:       data.forks_count,
        openIssues:  data.open_issues_count,
        language:    data.language,
        url:         data.html_url,
    };
}

module.exports = { gitHub };
