document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        prompt: '',
        geminiApiKey: '',
        vercelToken: '',
        techStack: 'react',
        imageData: null, 
    };

    // --- UI Elements ---
    const setupStep = document.getElementById('setup-step');
    const previewStep = document.getElementById('preview-step');
    const resultStep = document.getElementById('result-step');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error-message');
    const loadingText = document.getElementById('loading-text');

    // --- Buttons ---
    const generatePreviewBtn = document.getElementById('generate-preview-btn');
    const confirmDeployBtn = document.getElementById('confirm-deploy-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const startOverBtn = document.getElementById('start-over-btn');
    const downloadBtn = document.getElementById('download-btn');
    const removeImageBtn = document.getElementById('remove-image-btn'); 
    const directDeployBtn = document.getElementById('direct-deploy-btn'); 

    // --- Inputs ---
    const promptInput = document.getElementById('prompt');
    const geminiKeyInput = document.getElementById('geminiKey');
    const vercelTokenInput = document.getElementById('vercelToken');
    const techStackSelect = document.getElementById('tech-stack'); 
    const uiUploadInput = document.getElementById('ui-upload'); 
    const projectZipUploadInput = document.getElementById('project-zip-upload'); 
    const vercelTokenDirectInput = document.getElementById('vercelTokenDirect'); 

    // --- Outputs ---
    const previewLink = document.getElementById('preview-link');
    const liveUrlLink = document.getElementById('live-url');
    const imagePreviewContainer = document.getElementById('image-preview-container'); 
    const imagePreview = document.getElementById('image-preview'); 
    const zipUploadLabel = document.getElementById('zip-upload-label'); 


    // --- Event Listeners ---
    generatePreviewBtn.addEventListener('click', handleGeneratePreview);
    confirmDeployBtn.addEventListener('click', handleConfirmDeploy);
    cancelBtn.addEventListener('click', handleCancel);
    startOverBtn.addEventListener('click', resetToInitialState);
    downloadBtn.addEventListener('click', handleDownload);
    uiUploadInput.addEventListener('change', handleImageUpload); 
    removeImageBtn.addEventListener('click', handleRemoveImage); 
    directDeployBtn.addEventListener('click', handleDirectDeploy); 
    projectZipUploadInput.addEventListener('change', () => { 
        if (projectZipUploadInput.files.length > 0) {
            zipUploadLabel.textContent = projectZipUploadInput.files[0].name;
        } else {
            zipUploadLabel.textContent = 'Choose a .zip file...';
        }
    });

    // --- Functions ---
    function showScreen(screen) {
        const allSteps = [setupStep, previewStep, resultStep, loadingDiv];
        allSteps.forEach(step => step.classList.add('hidden'));
        
        if (screen === previewStep || screen === resultStep || screen === loadingDiv) {
             document.getElementById('direct-deploy-step').classList.add('hidden');
             document.querySelector('.divider').classList.add('hidden');
        } else {
            document.getElementById('direct-deploy-step').classList.remove('hidden');
            document.querySelector('.divider').classList.remove('hidden');
        }

        hideError();
        screen.classList.remove('hidden');
    }

    function resetToInitialState() {
        promptInput.value = '';
        geminiKeyInput.value = '';
        vercelTokenInput.value = '';
        vercelTokenDirectInput.value = '';
        techStackSelect.value = 'react';
        projectZipUploadInput.value = '';
        if(zipUploadLabel) zipUploadLabel.textContent = 'Choose a .zip file...';
        handleRemoveImage();
        showScreen(setupStep);
    }
    
    function setSafeUrl(linkElement, urlString) {
        if (!urlString) return;
        let cleanUrl = urlString.startsWith('https://') ? urlString : `https://${urlString}`;
        if (cleanUrl.startsWith('https://https://')) {
            cleanUrl = cleanUrl.substring(8);
        }
        linkElement.href = cleanUrl;
        if (linkElement.id === 'live-url') {
            linkElement.textContent = cleanUrl;
        }
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            state.imageData = reader.result;
            imagePreview.src = reader.result;
            imagePreviewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    function handleRemoveImage() {
        state.imageData = null;
        uiUploadInput.value = ''; 
        imagePreview.src = '#';
        imagePreviewContainer.classList.add('hidden');
    }

    async function handleGeneratePreview() {
        if (!techStackSelect) {
            showError("Error: The tech stack dropdown is missing from the HTML.");
            return;
        }

        state.prompt = promptInput.value;
        state.geminiApiKey = geminiKeyInput.value;
        state.vercelToken = vercelTokenInput.value;
        state.techStack = techStackSelect.value; 

        if (!state.prompt || !state.geminiApiKey || !state.vercelToken || !state.techStack) {
            showError('Please fill in all required fields for AI generation.');
            return;
        }

        showScreen(loadingDiv);
        loadingText.textContent = `Contacting AI to build a ${state.techStack} site... This may take a few minutes.`;
        
        try {
            const response = await fetch('/generate-preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state), 
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.details || 'Failed to generate preview.');
            }
            
            setSafeUrl(previewLink, data.previewUrl);
            showScreen(previewStep);

        } catch (error) {
            showError(`Preview generation failed: ${error.message}`);
            showScreen(setupStep);
        }
    }

    async function handleConfirmDeploy() {
        showScreen(loadingDiv);
        loadingText.textContent = 'Promoting to production... Please wait.';

        try {
            const response = await fetch('/confirm-and-deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vercelToken: state.vercelToken }),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.details || 'Failed to deploy to production.');
            }

            setSafeUrl(liveUrlLink, data.url);
            showScreen(resultStep);

        } catch (error) {
            showError(`Production deployment failed: ${error.message}`);
            showScreen(previewStep);
        }
    }

    async function handleCancel() {
        await fetch('/cancel-deployment', { method: 'POST' });
        resetToInitialState();
    }

    function handleDownload() {
        window.location.href = '/download-project';
    }

    async function handleDirectDeploy() {
        const vercelToken = vercelTokenDirectInput.value;
        const projectZip = projectZipUploadInput.files[0];

        if (!vercelToken || !projectZip) {
            showError('Please provide both a .zip file and a Vercel token for direct deployment.');
            return;
        }

        showScreen(loadingDiv);
        loadingText.textContent = 'Uploading and deploying your project...';

        const formData = new FormData();
        formData.append('vercelToken', vercelToken);
        formData.append('projectZip', projectZip);

        try {
            const response = await fetch('/upload-and-deploy', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.details || 'Failed to deploy the project.');
            }
            
            setSafeUrl(liveUrlLink, data.url);
            showScreen(resultStep);
            
        } catch (error) {
            showError(`Direct deployment failed: ${error.message}`);
            showScreen(setupStep);
        }
    }

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    function hideError() {
        errorDiv.classList.add('hidden');
    }
});
