document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        prompt: '',
        geminiApiKey: '',
        vercelToken: '',
        techStack: 'react',
        imageData: null, // --- NEW: To store the uploaded image data ---
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
    const removeImageBtn = document.getElementById('remove-image-btn'); // --- NEW ---

    // --- Inputs ---
    const promptInput = document.getElementById('prompt');
    const geminiKeyInput = document.getElementById('geminiKey');
    const vercelTokenInput = document.getElementById('vercelToken');
    const techStackSelect = document.getElementById('tech-stack'); 
    const uiUploadInput = document.getElementById('ui-upload'); // --- NEW ---

    // --- Outputs ---
    const previewLink = document.getElementById('preview-link');
    const liveUrlLink = document.getElementById('live-url');
    const imagePreviewContainer = document.getElementById('image-preview-container'); // --- NEW ---
    const imagePreview = document.getElementById('image-preview'); // --- NEW ---


    // --- Event Listeners ---
    generatePreviewBtn.addEventListener('click', handleGeneratePreview);
    confirmDeployBtn.addEventListener('click', handleConfirmDeploy);
    cancelBtn.addEventListener('click', handleCancel);
    startOverBtn.addEventListener('click', resetToInitialState);
    downloadBtn.addEventListener('click', handleDownload);
    uiUploadInput.addEventListener('change', handleImageUpload); // --- NEW ---
    removeImageBtn.addEventListener('click', handleRemoveImage); // --- NEW ---

    // --- Functions ---
    function showScreen(screen) {
        setupStep.classList.add('hidden');
        previewStep.classList.add('hidden');
        resultStep.classList.add('hidden');
        loadingDiv.classList.add('hidden');
        hideError();
        screen.classList.remove('hidden');
    }

    function resetToInitialState() {
        promptInput.value = '';
        geminiKeyInput.value = '';
        vercelTokenInput.value = '';
        techStackSelect.value = 'react';
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

    // --- NEW: Handle image upload and conversion to base64 ---
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

    // --- NEW: Handle removing the uploaded image ---
    function handleRemoveImage() {
        state.imageData = null;
        uiUploadInput.value = ''; // Reset the file input
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
            showError('Please fill in all required fields.');
            return;
        }

        showScreen(loadingDiv);
        loadingText.textContent = `Contacting AI to build a ${state.techStack} site... This may take a few minutes.`;
        
        try {
            const response = await fetch('/generate-preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state), // Send the whole state, including optional imageData
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

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    function hideError() {
        errorDiv.classList.add('hidden');
    }
});
