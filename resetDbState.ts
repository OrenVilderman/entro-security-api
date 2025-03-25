import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(__dirname, './db.state.json');

function resetDbState() {
    const emptyState = {};
    fs.writeFileSync(dbPath, JSON.stringify(emptyState, null, 2), 'utf-8');
    console.log('db.state.json has been reset to an empty object.');
}

resetDbState();