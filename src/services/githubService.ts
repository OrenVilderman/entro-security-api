import axios from "axios";

export async function getBranchCommitsCount(owner: string, repo: string, branch: string): Promise<number> {
    const githubToken = process.env.GITHUB_TOKEN;
    let page = 1;
    let commitsCount = 0;

    while (true) {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
            headers: {Authorization: `Bearer ${githubToken}`},
            params: {sha: branch, per_page: 100, page},
        });

        commitsCount += response.data.length;

        if (response.data.length < 100) break; // No more commits left

        page++;
    }

    console.log(commitsCount, 'commitCount', {repo}, {branch});
    return commitsCount;
}

export async function scanBranchCommits(owner: string, repo: string, branch: string, limit: number): Promise<{
    foundLeaks: any[],
    lastScannedIndex: number
}> {
    const githubToken = process.env.GITHUB_TOKEN;
    let page = 1;
    const foundLeaks: any[] = [];
    let scannedCommits = 0;
    let lastScannedIndex = 0;

    while (scannedCommits < limit) {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
            headers: {Authorization: `Bearer ${githubToken}`},
            params: {sha: branch, per_page: 100, page},
        });

        for (const commit of response.data) {
            if (scannedCommits >= limit) break;

            const commitDetails = await axios.get(commit.url, {
                headers: {Authorization: `Bearer ${githubToken}`},
            });

            const diff = await axios.get(commitDetails.data.html_url + '.diff', {
                headers: {Authorization: `Bearer ${githubToken}`},
            });

            const leakRegex = /github_pat|ghp|gho|ghu|ghs|ghr_[A-Za-z0-9_]{36,}/;
            const leaks = diff.data.match(leakRegex);

            if (leaks) {
                foundLeaks.push({
                    commit: commit.sha,
                    committer: commit.committer.login,
                    leakValue: leaks[0],
                });
            }

            scannedCommits++;
            lastScannedIndex++;
        }

        if (response.data.length < 100) break; // No more commits left

        page++;
    }

    return {foundLeaks, lastScannedIndex};
}