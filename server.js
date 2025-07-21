// Import required Node.js modules
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const util = require('util'); 
const archiver = require('archiver'); 

// Create a promisified version of exec
const execPromise = util.promisify(exec);

// Import the Google Gemini AI package
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const app = express();
// --- NEW: Increase the body size limit to allow for base64 images ---
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// --- This will store the path to the project waiting for confirmation ---
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

    switch (techStack) {
        case 'angular':
            fullPrompt = `
              You are an expert web designer specializing in Angular.
              Your task is to generate the HTML and CSS for a single Angular component based on the user's prompt and an accompanying image.
              ${imageInstruction}
              **User's Request:** "${prompt}"
              **Technical Requirements:**
              1.  **File Structure:** Generate only the following files: 'src/app/app.component.html', and 'src/app/app.component.css'.
              2.  **Output Format:** Respond with a single, valid JSON object.
              3.  **JSON Structure:** The JSON object must have file paths as keys and the complete code as a string value.
              4.  **Images:** Do NOT use local image paths like 'assets/image.png'. Instead, use placeholder images from https://placehold.co.`;
            dependencies = { 
                "@angular/common": "^16.0.0", "@angular/compiler": "^16.0.0", "@angular/core": "^16.0.0", 
                "@angular/forms": "^16.0.0", "@angular/platform-browser": "^16.0.0", "@angular/platform-browser-dynamic": "^16.0.0", 
                "rxjs": "~7.8.0", "tslib": "^2.3.0", "zone.js": "~0.13.0",
                "@angular-devkit/build-angular": "^16.0.0", "@angular/cli": "^16.0.0", "@angular/compiler-cli": "^16.0.0", "typescript": "~5.0.2"
            };
            scripts = { "start": "ng serve", "build": "ng build" };
            break;
        // ... other cases
        default: // React
            fullPrompt = `
              You are an expert full-stack web developer specializing in React.
              Your task is to generate the code for a single-page React application based on the user's prompt and an accompanying image.
              ${imageInstruction}
              **User's Request:** "${prompt}"
              **Technical Requirements:**
              1.  **Tech Stack:** Use React.js with standard CSS for styling.
              2.  **File Structure:** Generate 'public/index.html', 'src/index.js', 'src/App.js', 'src/App.css', and 'src/index.css'.
              3.  **Output Format:** Respond with a single, valid JSON object.
              4.  **JSON Structure:** The JSON object must have file paths as keys and the complete code as a string value.
              5.  **Images & SVGs:** Do NOT use local image paths or SVG file imports. Instead, use placeholder images from https://placehold.co OR use inline SVG for icons.`;
            dependencies = { "react": "^18.2.0", "react-dom": "^18.2.0", "react-scripts": "5.0.1" };
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

    // --- NEW: Construct the prompt parts for multimodal input ---
    const promptParts = [
        { text: fullPrompt }
    ];

    if (imageData) {
        console.log("Image data received, adding to prompt.");
        const imagePart = {
            inlineData: {
                mimeType: 'image/png', // Assuming PNG, can be made dynamic
                data: imageData.split(',')[1] // Remove the base64 prefix
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
    // --- NEW: Accept imageData from the request ---
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
        if (techStack === 'angular') {
            await fs.mkdir(path.join(projectPath, 'src', 'app'), { recursive: true });
        } else {
             for (const filePath of Object.keys(files)) {
                await fs.mkdir(path.dirname(path.join(projectPath, filePath)), { recursive: true });
            }
        }

        for (const [filePath, content] of Object.entries(files)) {
            await fs.writeFile(path.join(projectPath, filePath), content);
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

        if (techStack === 'angular') {
            console.log('Creating Angular boilerplate files...');
            const angularJsonContent = {
                "$schema": "./node_modules/@angular/cli/lib/config/schema.json", "version": 1, "newProjectRoot": "projects",
                "projects": {
                    [`ai-${projectName}`]: {
                        "projectType": "application", "root": "", "sourceRoot": "src", "prefix": "app",
                        "architect": { "build": {
                                "builder": "@angular-devkit/build-angular:browser",
                                "options": {
                                    "outputPath": "dist", "index": "src/index.html", "main": "src/main.ts",
                                    "polyfills": "src/polyfills.ts", "tsConfig": "tsconfig.app.json", "assets": [],
                                    "styles": ["src/styles.css"], "scripts": []
                                }}}}}
            };
            await fs.writeFile(path.join(projectPath, 'angular.json'), JSON.stringify(angularJsonContent, null, 2));

            const tsconfigContent = {
                "compileOnSave": false,
                "compilerOptions": {
                    "baseUrl": "./", "outDir": "./dist/out-tsc", "forceConsistentCasingInFileNames": true, "strict": true,
                    "noImplicitOverride": true, "noPropertyAccessFromIndexSignature": true, "noImplicitReturns": true,
                    "noFallthroughCasesInSwitch": true, "sourceMap": true, "declaration": false, "downlevelIteration": true,
                    "experimentalDecorators": true, "moduleResolution": "node", "importHelpers": true, "target": "ES2022",
                    "module": "ES2022", "useDefineForClassFields": false, "lib": ["ES2022", "dom"]
                },
                "angularCompilerOptions": {
                    "enableI18nLegacyMessageIdFormat": false, "strictInjectionParameters": true,
                    "strictInputAccessModifiers": true, "strictTemplates": true
                }
            };
            await fs.writeFile(path.join(projectPath, 'tsconfig.app.json'), JSON.stringify(tsconfigContent, null, 2));
            
            await fs.writeFile(path.join(projectPath, 'src/polyfills.ts'), `import 'zone.js';`);
            await fs.writeFile(path.join(projectPath, 'src/styles.css'), '/* Add global styles to this file, and also import other style files */');
            await fs.writeFile(path.join(projectPath, 'src/index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>AI Generated Angular App</title><base href="/"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" type="image/x-icon" href="favicon.ico"></head><body><app-root></app-root></body></html>`);
            await fs.writeFile(path.join(projectPath, 'src/main.ts'), `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';\nimport { AppModule } from './app/app.module';\n\nplatformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));`);
            await fs.writeFile(path.join(projectPath, 'src/app/app.module.ts'), `import { NgModule } from '@angular/core';\nimport { BrowserModule } from '@angular/platform-browser';\nimport { AppComponent } from './app.component';\n\n@NgModule({\n  declarations: [AppComponent],\n  imports: [BrowserModule],\n  providers: [],\n  bootstrap: [AppComponent]\n})\nexport class AppModule { }`);
            
            const htmlContent = files['src/app/app.component.html'] || '';
            const ngForRegex = /let\s+\w+\s+of\s+(\w+)/g;
            let match;
            const properties = new Set();
            while ((match = ngForRegex.exec(htmlContent)) !== null) {
                properties.add(match[1]);
            }

            let propertiesString = `  title = 'ai-generated-app';\n`;
            properties.forEach(prop => {
                propertiesString += `  ${prop}: any[] = []; // Auto-generated property\n`;
            });
            
            const appComponentTsContent = `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-root',\n  templateUrl: './app.component.html',\n  styleUrls: ['./app.component.css']\n})\nexport class AppComponent {\n${propertiesString}}`;
            await fs.writeFile(path.join(projectPath, 'src/app/app.component.ts'), appComponentTsContent);
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

// --- NEW ENDPOINT: Download Project ---
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


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Orchestrator server listening at http://localhost:${PORT}`);
});
