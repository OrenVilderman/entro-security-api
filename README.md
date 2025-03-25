# GitHub Leak Scanner

![Leak Detection Example](./assets/leak-example.png)

A tool to scan GitHub repositories for leaked secrets.

## Table of Contents

- [Endpoints](#endpoints)
- [Usage](#usage)
- [Example Output](#example-output)

## Endpoints

### Initialize Project List

- **URL**: `/api/github/projects/init`
- **Method**: `GET`
- **Description**: Initializes the list of projects to scan.

### Get Project Status

- **URL**: `/api/github/projects/status`
- **Method**: `GET`
- **Description**: Retrieves the current status of the projects, including branches and found leaks.

#### Example Response:

```json
{
  "id": 954765988,
  "name": "TestLeak",
  "full_name": "OrenVilderman/TestLeak",
  "branches": [
    {
      "name": "main",
      "scanIndex": 3,
      "commitsToScan": 3,
      "foundLeaks": [
        {
          "commit": "4b0fc2d3f5e7ef51e873a6e91a5ee8596a9e51a6",
          "committer": "Oren Vilderman",
          "message": "this is a code leak",
          "leakValue": "github_pat_1234567890abcdefghijklmnopqrstuvwxyzABCDE"
        }
      ]
    }
  ]
}
```

### Scan a Repository

- **URL**: `/api/github/projects/scan`
- **Method**: `GET`
- **Description**: Scans the repositories for leaks and updates the status.

## Usage Example

### Scan a Repository

To scan a repository for leaks, run:

```sh
curl -X GET "http://localhost:3000/api/github/projects/scan"
```

## Example Output

After scanning, if leaks are found, the response will contain details like:

```json
{
  "commit": "f870af223a6044664d7a84e59a1b02ad7a626621",
  "committer": "Oren Vilderman",
  "message": "This is json file leak",
  "leakValue": "gho_ABC123def456ghi789jkl012mno345pqr678stu901vwx234, ghr_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12"
}
```

## Disclaimer
- This project was completed **after the official time limit** of the test.
- The mechanism that includes **direct commit URLs** (`commitUrl`) to allow easy access to the commit without requiring an additional API call was implemented **after the deadline**.

## Areas for Improvement
- The project contains **four instances of `// @ts-ignore`**, which should be removed by properly handling TypeScript type issues.

## Resetting the Database
- If a new GitHub token is used, the database must be reset manually.
- Run the following command to reset the database:
```sh
npm run reset-db
```
- ⚠️ **Warning:** This will delete the existing database information, including pre-filled data for review.
- After running this script, calling `http://localhost:3000/api/github/projects/status` will return an empty state.

