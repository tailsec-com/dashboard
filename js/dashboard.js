const REPOS = [
    'tailsec-com/scan-code',
    'tailsec-com/scan-container',
    'tailsec-com/scan-secrets',
    'tailsec-com/scan-k8s',
    'tailsec-com/scan-terraform',
    'tailsec-com/scan-deps',
    'tailsec-com/scan-license',
    'tailsec-com/scan-cfn',
    'tailsec-com/scan-docker',
    'tailsec-com/scan-sast',
    'tailsec-com/scan-aws',
    'tailsec-com/scan-azure',
    'tailsec-com/scan-gcp',
    'tailsec-com/scan-helm',
    'tailsec-com/scan-kustomize',
    'tailsec-com/scan-python',
    'tailsec-com/scan-go',
    'tailsec-com/scan-ruby',
    'tailsec-com/ci-templates',
    'tailsec-com/vscode-extension',
    'tailsec-com/homebrew-tap',
    'tailsec-com/benchmarks',
    'tailsec-com/rule-sync',
    'tailsec-com/.github',
    'tailsec-com/tailsec.io',
    'tailsec-com/branding',
    'tailsec-com/dashboard',
    'tailsec-com/tailsec-com',
];

async function fetchRepoStatus(repo) {
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

async function fetchAllStatuses() {
    const grid = document.getElementById('repos-grid');
    grid.innerHTML = '<p style="padding:2rem;text-align:center;color:var(--text-muted)">Loading...</p>';

    const statuses = await Promise.all(REPOS.map(fetchRepoStatus));

    let passing = 0, failing = 0, pending = 0;

    grid.innerHTML = '';
    for (const s of statuses) {
        if (s.status === 'pass') passing++;
        else if (s.status === 'fail') failing++;
        else pending++;

        const card = document.createElement('div');
        card.className = 'repo-card';
        card.innerHTML = `
            <div class="repo-card-header">
                <span class="repo-name"><a href="https://github.com/${s.repo}">${s.repo.split('/')[1]}</a></span>
                <span class="status-badge ${s.status}">${s.message || 'no ci'}</span>
            </div>
            <div class="repo-meta">${s.sha ? `<code>${s.sha}</code>` : ''} · ${s.repo}</div>
        `;
        grid.appendChild(card);
    }

    document.getElementById('passing').textContent = passing;
    document.getElementById('failing').textContent = failing;
    document.getElementById('pending').textContent = pending;
    document.getElementById('total-repos').textContent = `${REPOS.length} repos`;
    document.getElementById('last-updated').textContent = `Updated: ${new Date().toLocaleTimeString()}`;
}

function refreshDashboard() {
    fetchAllStatuses();
}

fetchAllStatuses();
setInterval(fetchAllStatuses, 5 * 60 * 1000);