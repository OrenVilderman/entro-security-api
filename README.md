# Entro Security API

This project is an API for managing and scanning GitHub repositories for security leaks. It is built using TypeScript, Express, and Axios.

## Setup

1. **Clone the repository**:
   ```sh
   git clone https://github.com/OrenVilderman/entro-security-api.git
   cd entro-security-api
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Create a `.env` file**:
   ```sh
   touch .env
   ```

4. **Add your GitHub Personal Access Token to the `.env` file**:
   ```dotenv
   GITHUB_TOKEN={Replace with your GitHub personal access token}
   ```

5. **Build the project**:
   ```sh
   npm run build
   ```

6. **Start the server**:
   ```sh
   npm start
   ```

## Endpoints

### Initialize Projects

- **URL**: `/api/github/projects/init`
- **Method**: `GET`
- **Description**: Fetches the user's GitHub repositories and initializes the project state with branches and commit counts.

### Get Project Status

- **URL**: `/api/github/projects/status`
- **Method**: `GET`
- **Description**: Retrieves the current status of the projects, including branches and found leaks.

### Scan Projects

- **URL**: `/api/github/projects/scan`
- **Method**: `GET`
- **Description**: Scans the branches of the user's GitHub repositories for security leaks.
- **Query Parameters**:
  - `limit` (optional): The maximum number of commits to scan.

## .env File

The `.env` file should contain the following environment variable:

- `GITHUB_TOKEN`: Your GitHub Personal Access Token. This token is required to authenticate API requests to GitHub.

Example `.env` file:
```dotenv
GITHUB_TOKEN=your_github_personal_access_token
```

## Scripts

- **`npm run build`**: Compiles the TypeScript code to JavaScript.
- **`npm start`**: Starts the server.
- **`npm run dev`**: Starts the server in development mode using `nodemon`.

## License

This project is licensed under the ISC License.
