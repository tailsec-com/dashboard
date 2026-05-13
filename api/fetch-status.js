export async function fetchRepoStatus(repo) {
    const response = await fetch(`https://api.github.com/repos/${repo}/commits/main/status`);
    if (!response.ok) return { repo, status: 'none', message: 'No CI' };
    const data = await response.json();
    return {
        repo,
        status: data.state === 'success' ? 'pass' : data.state === 'failure' ? 'fail' : 'pending',
        sha: data.sha?.substring(0, 7),
        message: data.state
    };
}

export async function fetchAllStatuses(repos) {
    return Promise.all(repos.map(fetchRepoStatus));
}