import fs from 'fs';
import path from 'path';
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
    const dbPath = path.resolve(__dirname, '../../db.state.json');
    const dbState = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

    const project = dbState.projects.find((p: any) => p.name === repo);
    if (!project) {
        throw new Error(`Repository ${repo} is not listed in db.state.json`);
    }

    const branchState = project.branches.find((b: any) => b.name === branch);
    if (!branchState) {
        throw new Error(`Branch ${branch} is not listed in db.state.json for repository ${repo}`);
    }

    const commitUrl = branchState.commitUrl;
    const githubToken = process.env.GITHUB_TOKEN;
    let page = 1;
    const foundLeaks: any[] = [];
    const leakSet = new Set<string>(); // Set to track found leaks
    let scannedCommits = 0;
    let lastScannedIndex = 0;
    const commitsToScan = branchState.commitsToScan;

    while (scannedCommits < limit && scannedCommits < commitsToScan) {
        const response = await axios.get(commitUrl, {
            headers: { Authorization: `Bearer ${githubToken}` },
            params: { sha: branch, per_page: 100, page },
        });

        for (const commit of response.data) {
            if (scannedCommits >= limit || scannedCommits >= commitsToScan) break;

            const commitDetails = await axios.get(commit.url, {
                headers: { Authorization: `Bearer ${githubToken}` },
            });

            const diff = await axios.get(commitDetails.data.html_url + '.diff', {
                headers: { Authorization: `Bearer ${githubToken}` },
            });

            const leakRegex = /(github_pat|ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}/g;
            const leaks = diff.data.match(leakRegex);

            if (leaks) {
                const uniqueLeaks = Array.from(new Set(leaks)); // Get unique leaks in the commit
                // @ts-ignore
                const newLeaks = uniqueLeaks.filter(leak => !leakSet.has(leak)); // Filter out already found leaks

                if (newLeaks.length > 0) {
                    // @ts-ignore
                    newLeaks.forEach(leak => leakSet.add(leak)); // Add new leaks to the set

                    foundLeaks.push({
                        commit: commit.sha,
                        committer: commit.commit.committer.name || commit.commit.committer.login,
                        message: commit.commit.message,
                        leakValue: newLeaks.join(', '), // Store the aggregated leaked strings
                    });
                }
            }

            scannedCommits++;
            lastScannedIndex++;
        }

        if (response.data.length < 100) break; // No more commits left

        page++;
    }

    return { foundLeaks, lastScannedIndex };
}