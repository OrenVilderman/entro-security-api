import express from 'express';
import { initProjects, getProjectStatus, scanProjects } from './controllers/projectController';
const app = express();
app.use(express.json());

app.get('/api/github/projects/init', initProjects);
app.get('/api/github/projects/status', getProjectStatus);
app.get('/api/github/projects/scan', scanProjects);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});