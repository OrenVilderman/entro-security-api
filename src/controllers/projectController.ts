import { Request, Response } from 'express';
import axios from 'axios';
import { readState, writeState, State, Branch } from '../utils/stateUtils';
import { getBranchCommitsCount, scanBranchCommits } from '../services/githubService';
import dotenv from "dotenv";
dotenv.config();

const githubToken = process.env.GITHUB_TOKEN;

export async function initProjects(_req: Request, res: Response) {
    try {
        const reposResponse = await axios.get('https://api.github.com/user/repos', {
            headers: { Authorization: `Bearer ${githubToken}` },
        });

        const state: State = readState();
        state.projects = [];

        for (const repo of reposResponse.data) {
            const branchesResponse = await axios.get(`https://api.github.com/repos/${repo.full_name}/branches`, {
                headers: { Authorization: `Bearer ${githubToken}` },
            });

            const branches: Branch[] = [];

            for (const branch of branchesResponse.data) {
                const commitsCount = await getBranchCommitsCount(repo.owner.login, repo.name, branch.name);

                branches.push({
                    name: branch.name,
                    scanIndex: 0,
                    commitsToScan: commitsCount,
                    foundLeaks: [],
                    commitUrl: `https://api.github.com/repos/${repo.full_name}/commits`
                });
            }

            state.projects.push({
                id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                branches: branches
            });
        }

        writeState(state);

        res.status(200).json(state.projects);
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        res.status(500).json({ message: 'Error fetching GitHub projects', error: error });
    }
}

export async function getProjectStatus(_req: Request, res: Response) {
    try {
        const state: State = readState();
        res.status(200).json(state.projects);
    } catch (error) {
        console.error('Error fetching project status:', error);
        res.status(500).json({ message: 'Error fetching project status', error: error });
    }
}

export async function scanProjects(_req: Request, res: Response) {
    try {
        const state: State = readState();
        const globalLimit = parseInt(_req.query.limit as string) || Number.MAX_SAFE_INTEGER;
        let totalScannedCommits = 0;

        for (const project of state.projects) {
            for (const branch of project.branches) {
                if (branch.scanIndex < branch.commitsToScan) {
                    console.log(`Processing branch: ${branch.name} of repo: ${project.full_name}`);

                    const remainingLimit = globalLimit - totalScannedCommits;
                    if (remainingLimit <= 0) break;

                    const limit = Math.min(remainingLimit, branch.commitsToScan - branch.scanIndex);
                    const { foundLeaks, lastScannedIndex } = await scanBranchCommits(project.full_name.split('/')[0], project.name, branch.name, limit);
                    console.log(`Found leaks in branch '${branch.name}': ${foundLeaks.length}`);

                    branch.scanIndex += lastScannedIndex;
                    branch.foundLeaks.push(...foundLeaks);

                    totalScannedCommits += lastScannedIndex;
                }
            }

            if (totalScannedCommits >= globalLimit) break;
        }

        writeState(state);

        res.status(200).json(state.projects);
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        res.status(500).json({ message: 'Error fetching GitHub projects', error: error });
    }
}