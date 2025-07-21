# Invoice Management System

## Project Structure
This repository contains a nested structure where the actual React application is located inside the `invoice-management` directory.

## How to Run the Application

### Multiple Ways to Start the App

#### 1. Using npm from the Root Directory
We've added a wrapper package.json in the root directory that delegates commands to the inner project:
```
npm start
```

#### 2. Using the Provided Scripts
For convenience, we've added scripts to make it easier to start the application:

- **Windows Command Prompt**: Double-click on `start-app.bat` 
- **PowerShell**: Right-click on `start-app.ps1` and select "Run with PowerShell" or execute it from PowerShell with `.\start-app.ps1`

#### 3. Manual Start
If you prefer to start the application manually:

1. Open a terminal or command prompt
2. Navigate to the inner invoice-management directory:
   ```
   cd invoice-management
   ```
3. Start the React development server:
   ```
   npm start
   ```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Troubleshooting

If you encounter the error:
```
'react-scripts' is not recognized as an internal or external command
```

or 

```
Could not read package.json: Error: ENOENT: no such file or directory
```

Make sure you are using one of the recommended start methods above.

## Development

All development work should be done within the `invoice-management` directory as it contains the proper React project structure with all necessary dependencies.

## Project Structure Explanation

```
D:\project pushpendra\invoice-management\         <-- Root directory
├── package.json                                  <-- Wrapper package.json
├── start-app.bat                                 <-- Batch script to start app
├── start-app.ps1                                 <-- PowerShell script to start app 
├── README.md                                     <-- This file
└── invoice-management\                           <-- Actual React app directory
    ├── package.json                              <-- React app package.json
    ├── src\                                      <-- Source code
    └── public\                                   <-- Public assets
``` 