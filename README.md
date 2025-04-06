#LM Frontend

This repository contains the frontend code for the LM project. Below, I explain step-by-step how to deploy it locally on Windows.

---

##Prerequisites

Before you begin, make sure you have installed:

- **Node.js** (recommended version: `v22.14.0`)

If you don't have it installed:

1. Download it from the official website: https://nodejs.org/en/
2. During the installation, select the option that says **"Automatically install the necessary tools..."** (this will also install Python and the Build Tools).
3. Restart your computer after installing.

To verify that everything is installed correctly, open a terminal (PowerShell or CMD) and run:
node -v
npm -v

If the version of each one appears (for example: v22.14.0 for Node and something similar for npm), then you're ready to run the project.
Now run these commands in order inside the project folder:
npm install --legacy-peer-deps
npm run dev

After the last command, a local server will open. Copy and paste the link that appears in the terminal into your browser (usually http://localhost:3000).
And that's it! You should now see the project running in your browser.
