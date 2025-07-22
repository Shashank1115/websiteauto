// Import required Node.js modules
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const util = require('util'); 
const archiver = require('archiver'); 
const multer = require('multer');
const extract = require('extract-zip');

// Create a promisified version of exec
const execPromise = util.promisify(exec);

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Import the Google Gemini AI package
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

let pendingProjectPath = null;
let lastDeployedProjectPath = null; 

// --- Function to get the correct prompt and dependencies for each tech stack ---
function getTechStackDetails(techStack, prompt, hasImage) {
    let fullPrompt = '';
    let dependencies = {};
    let scripts = {};
    
    const imageInstruction = hasImage 
        ? "The user has provided an image as a visual reference. Prioritize matching the layout, color scheme, and components shown in the image."
        : "The user has not provided an image. Generate the design based solely on the text prompt.";
    
    const contentInstruction = "Crucially, populate all pages with rich, context-appropriate placeholder content. The website should look complete and well-designed, not like an empty template. Add descriptive text, lists, and visually appealing layouts."

    switch (techStack) {
        case 'angular':
            fullPrompt = `
              You are an expert web developer specializing in Angular and Tailwind CSS.
              Your task is to generate a complete, production-ready, MULTI-PAGE Angular application.
              **User's Request:** "${prompt}"
              ${imageInstruction}
              ${contentInstruction}
              **Technical Requirements:**
              1.  **Tech Stack:** Use Angular, TypeScript, and Tailwind CSS.
              2.  **Routing:** Use '@angular/router'. The main 'app.routes.ts' should define the routes, and 'app.component.html' should contain the <router-outlet>.
              3.  **File Structure:** Generate separate component files for each page inside 'src/app/pages/'. Also generate 'src/app/app.component.ts', 'src/app/app.component.html', 'src/app/app.routes.ts', 'src/main.ts', 'src/index.html', and 'tailwind.config.js'.
              4.  **Output Format:** Respond with a single, valid JSON object.
              5.  **Images:** Use placeholder images from https://placehold.co.`;
            dependencies = { 
                "@angular/common": "^16.0.0", "@angular/compiler": "^16.0.0", "@angular/core": "^16.0.0", 
                "@angular/forms": "^16.0.0", "@angular/platform-browser": "^16.0.0", "@angular/platform-browser-dynamic": "^16.0.0", 
                "@angular/router": "^16.0.0", "rxjs": "~7.8.0", "tslib": "^2.3.0", "zone.js": "~0.13.0",
                "@angular-devkit/build-angular": "^16.0.0", "@angular/cli": "^16.0.0", "@angular/compiler-cli": "^16.0.0", 
                "typescript": "~5.0.2", "tailwindcss": "^3.3.3"
            };
            scripts = { "start": "ng serve", "build": "ng build" };
            break;
        case 'vue':
            fullPrompt = `
              You are an expert web developer specializing in Vue.js and Tailwind CSS.
              Your task is to generate a complete, production-ready, MULTI-PAGE Vue application.
              **User's Request:** "${prompt}"
              ${imageInstruction}
              ${contentInstruction}
              **Technical Requirements:**
              1.  **Tech Stack:** Use Vue 3 and Tailwind CSS.
              2.  **Routing:** Use 'vue-router'. The main 'src/router/index.js' should define the routes.
              3.  **File Structure:** Generate separate component files for each page inside 'src/views/'. Generate 'src/App.vue' (with <router-view>), 'src/router/index.js', 'src/main.js', 'index.html', and 'tailwind.config.js'.
              4.  **Output Format:** Respond with a single, valid JSON object.
              5.  **Images:** Use placeholder images from https://placehold.co.`;
            dependencies = { "vue": "^3.3.4", "vue-router": "^4.2.4", "tailwindcss": "^3.3.3" };
            scripts = { "serve": "vue-cli-service serve", "build": "vue-cli-service build" };
            break;
        default: // React with Tailwind CSS
            fullPrompt = `
              You are an expert full-stack web developer specializing in React and Tailwind CSS.
              Your task is to generate a complete, production-ready, MULTI-PAGE React application.
              **User's Request:** "${prompt}"
              ${imageInstruction}
              ${contentInstruction}
              **Technical Requirements:**
              1.  **Tech Stack:** Use React.js with Tailwind CSS for all styling.
              2.  **Routing:** Use 'react-router-dom'. The main 'App.js' should set up the router.
              3.  **File Structure:** Generate separate component files for each page inside 'src/pages/'. Generate 'src/App.js', 'public/index.html' (with Tailwind CDN script), 'src/index.js', and a basic 'src/index.css'.
              4.  **Output Format:** Respond with a single, valid JSON object.
              5.  **Images & SVGs:** Use placeholder images from https://placehold.co OR use inline SVG for icons.`;
            dependencies = { 
                "react": "^18.2.0", "react-dom": "^18.2.0", "react-scripts": "5.0.1",
                "react-router-dom": "^6.23.1", "tailwindcss": "^3.3.3"
            };
            scripts = { "start": "react-scripts start", "build": "react-scripts build" };
            break;
    }
    return { fullPrompt, dependencies, scripts };
}


// Function to call the Gemini API
async function generateCodeFromAI(prompt, apiKey, techStack, imageData) {
    console.log(`AI task started for prompt: "${prompt}" with tech stack: ${techStack}`);

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        safetySettings
    });

    const { fullPrompt } = getTechStackDetails(techStack, prompt, !!imageData);

    const promptParts = [ { text: fullPrompt } ];

    if (imageData) {
        console.log("Image data received, adding to prompt.");
        const imagePart = {
            inlineData: {
                mimeType: 'image/png',
                data: imageData.split(',')[1] 
            }
        };
        promptParts.push(imagePart);
    }


    try {
        const result = await model.generateContent({ contents: [{ role: "user", parts: promptParts }] });
        const response = await result.response;
        const text = response.text();

        if (!text) {
            throw new Error("The AI returned an empty response.");
        }

        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}');
        
        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
            throw new Error("Could not find a valid JSON object in the AI response.");
        }

        const jsonString = text.substring(startIndex, endIndex + 1);
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error in generateCodeFromAI:", error);
        throw error;
    }
}

// --- ENDPOINT: Step 1 - Generate Preview ---
app.post('/generate-preview', async (req, res) => {
    const { prompt, geminiApiKey, vercelToken, techStack, imageData } = req.body;
    if (!prompt || !geminiApiKey || !vercelToken || !techStack) {
        return res.status(400).json({ error: 'Prompt, Gemini Key, Vercel Token, and Tech Stack are required' });
    }

    try {
        const files = await generateCodeFromAI(prompt, geminiApiKey, techStack, imageData);
        
        const projectName = `proj-${Date.now()}`;
        const projectPath = path.join(__dirname, 'generated-projects', projectName);
        pendingProjectPath = projectPath; 
        
        console.log(`Creating project files at: ${projectPath}`);
        for (const filePath of Object.keys(files)) {
            await fs.mkdir(path.dirname(path.join(projectPath, filePath)), { recursive: true });
        }

        for (const [filePath, content] of Object.entries(files)) {
            const contentToWrite = (typeof content === 'string') ? content : JSON.stringify(content, null, 2);
            await fs.writeFile(path.join(projectPath, filePath), contentToWrite);
        }
        
        const { dependencies, scripts } = getTechStackDetails(techStack, prompt, !!imageData);
        const packageJsonContent = {
            "name": `ai-${projectName}`,
            "version": "0.1.0",
            "private": true,
            "dependencies": dependencies,
            "scripts": scripts,
        };
        await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify(packageJsonContent, null, 2));

        // --- NEW: Safety check to ensure critical files exist for React ---
        if (techStack === 'react') {
            const requiredFiles = {
                'public/index.html': `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><script src="https://cdn.tailwindcss.com"></script><title>AI Generated React App</title></head><body><noscript>You need to enable JavaScript to run this app.</noscript><div id="root"></div></body></html>`,
                'src/index.js': `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport './index.css';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`
            };

            for (const [filePath, content] of Object.entries(requiredFiles)) {
                const fullPath = path.join(projectPath, filePath);
                try {
                    await fs.access(fullPath);
                } catch (e) {
                    console.log(`React file '${filePath}' not found. Creating a standard one...`);
                    await fs.mkdir(path.dirname(fullPath), { recursive: true });
                    await fs.writeFile(fullPath, content);
                }
            }
        }
        
        console.log('Project files created. Starting PREVIEW deployment...');
        
        const deployCommand = `vercel "${projectPath}" --yes --token=${vercelToken}`;
        const { stdout } = await execPromise(deployCommand);
        
        const urlMatch = stdout.match(/https?:\/\/[^\s]+/);
        if (!urlMatch || !urlMatch[0]) {
            throw new Error("Could not parse a valid preview URL from Vercel's response.");
        }
        const previewUrl = urlMatch[0];
        
        console.log(`Preview deployment successful! URL: ${previewUrl}`);
        
        res.json({ success: true, previewUrl: previewUrl });

    } catch (error) {
        console.error('Preview generation failed:', error);
        res.status(500).json({ success: false, message: 'An error occurred during preview generation.', details: error.stderr || error.message });
    }
});

// --- ENDPOINT: Step 2 - Confirm and Deploy to Production ---
app.post('/confirm-and-deploy', async (req, res) => {
    const { vercelToken } = req.body;
    if (!pendingProjectPath) {
        return res.status(400).json({ error: 'No project is awaiting deployment.' });
    }
    if (!vercelToken) {
        return res.status(400).json({ error: 'Vercel Token is required' });
    }

    try {
        console.log(`Promoting project to production: ${pendingProjectPath}`);
        const deployCommand = `vercel "${pendingProjectPath}" --prod --yes --token=${vercelToken}`;
        const { stdout } = await execPromise(deployCommand);
        
        const urlMatch = stdout.match(/https?:\/\/[^\s]+/);
        if (!urlMatch || !urlMatch[0]) {
            throw new Error("Could not parse a valid production URL from Vercel's response.");
        }
        const finalUrl = urlMatch[0];
        
        console.log(`Production deployment successful! URL: ${finalUrl}`);
        
        lastDeployedProjectPath = pendingProjectPath; 
        pendingProjectPath = null;

        res.json({ success: true, url: finalUrl });

    } catch (error) {
        console.error('Production deployment failed:', error);
        res.status(500).json({ success: false, message: 'An error occurred during production deployment.', details: error.stderr || error.message });
    }
});

// --- ENDPOINT: Cancel Deployment ---
app.post('/cancel-deployment', async (req, res) => {
    if (pendingProjectPath) {
        try {
            console.log(`Cancelling and cleaning up project: ${pendingProjectPath}`);
            await fs.rm(pendingProjectPath, { recursive: true, force: true });
            pendingProjectPath = null;
            res.json({ success: true, message: 'Deployment cancelled and files cleaned up.' });
        } catch (error) {
            console.error('Cleanup failed:', error);
            res.status(500).json({ success: false, message: 'Failed to clean up project files.' });
        }
    } else {
        res.json({ success: true, message: 'No active project to cancel.' });
    }
});

// --- ENDPOINT: Download Project ---
app.get('/download-project', (req, res) => {
    if (!lastDeployedProjectPath) {
        return res.status(404).send('No project available for download.');
    }

    const projectName = path.basename(lastDeployedProjectPath);
    const zipFileName = `${projectName}.zip`;
    
    res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${zipFileName}`
    });

    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    archive.on('error', function(err) {
        throw err;
    });

    archive.pipe(res);
    archive.directory(lastDeployedProjectPath, false);
    archive.finalize();
});

// --- NEW ENDPOINT: Upload and Deploy Existing Project ---
app.post('/upload-and-deploy', upload.single('projectZip'), async (req, res) => {
    const { vercelToken } = req.body;
    if (!req.file) {
        return res.status(400).json({ error: 'No zip file uploaded.' });
    }
    if (!vercelToken) {
        return res.status(400).json({ error: 'Vercel Token is required.' });
    }

    const zipPath = req.file.path;
    const extractPath = path.join(__dirname, 'generated-projects', `uploaded-${Date.now()}`);

    try {
        console.log(`Unzipping ${zipPath} to ${extractPath}`);
        await extract(zipPath, { dir: extractPath });

        console.log('Unzip complete. Starting deployment...');
        const deployCommand = `vercel "${extractPath}" --prod --yes --token=${vercelToken}`;
        const { stdout } = await execPromise(deployCommand);
        
        const urlMatch = stdout.match(/https?:\/\/[^\s]+/);
        if (!urlMatch || !urlMatch[0]) {
            throw new Error("Could not parse a valid production URL from Vercel's response.");
        }
        const finalUrl = urlMatch[0];

        console.log(`Direct deployment successful! URL: ${finalUrl}`);
        res.json({ success: true, url: finalUrl });

    } catch (error) {
        console.error('Direct deployment failed:', error);
        res.status(500).json({ success: false, message: 'An error occurred during direct deployment.', details: error.stderr || error.message });
    } finally {
        // Cleanup the uploaded zip and extracted folder
        await fs.unlink(zipPath);
        await fs.rm(extractPath, { recursive: true, force: true });
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Orchestrator server listening at http://localhost:${PORT}`);
});
