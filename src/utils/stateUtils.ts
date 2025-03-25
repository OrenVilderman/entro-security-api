import fs from 'fs';
import path from 'path';

const STATE_FILE = path.join(__dirname, '../db.state.json');

export interface Branch {
    name: string;
    scanIndex: number;
    commitsToScan: number;
    foundLeaks: string[];
}

export interface Project {
    id: number;
    name: string;
    full_name: string;
    branches: Branch[];
}

export interface State {
    projects: Project[];
}

export function readState(): State {
    if (!fs.existsSync(STATE_FILE)) {
        fs.writeFileSync(STATE_FILE, JSON.stringify({ projects: [] }));
    }
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
}

export function writeState(state: State) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}