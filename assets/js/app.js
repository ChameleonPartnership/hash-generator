/**
 * Hash Generator - Production-Ready Application
 * Supports: MD5, SHA-1, SHA-256, SHA-384, SHA-512
 * Features: Text input, file upload, hash verification, dark mode, accessibility
 */

// ============================================================================
// CONSTANTS & STATE
// ============================================================================

const STATE = {
    currentInput: '',
    currentAlgorithms: ['SHA-256'],
    uppercase: false,
    theme: localStorage.getItem('theme') || 'light',
    history: JSON.parse(localStorage.getItem('hashHistory') || '[]'),
    selectedFile: null,
    maxFileSize: 100 * 1024 * 1024, // 100MB
};

const ALGORITHMS = {
    'MD5': { label: 'MD5', len: 32 },
    'SHA-1': { label: 'SHA-1', len: 40 },
    'SHA-256': { label: 'SHA-256', len: 64 },
    'SHA-384': { label: 'SHA-384', len: 96 },
    'SHA-512': { label: 'SHA-512', len: 128 },
};

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const DOM = {
    textInput: document.getElementById('textInput'),
    fileInput: document.getElementById('fileInput'),
    dropZone: document.getElementById('dropZone'),
    fileInfo: document.getElementById('fileInfo'),
    verifyInput: document.getElementById('verifyInput'),
    hashToCompare: document.getElementById('hashToCompare'),
    verifyResult: document.getElementById('verifyResult'),
    clearText: document.getElementById('clearText'),
    charCount: document.querySelector('.char-count'),
    generateAll: document.getElementById('generateAll'),
    hashOutput: document.getElementById('hashOutput'),
    historySection: document.getElementById('historySection'),
    historyList: document.getElementById('historyList'),
    clearHistory: document.getElementById('clearHistory'),
    themeToggle: document.getElementById('themeToggle'),
    uppercaseToggle: document.getElementById('uppercaseToggle'),
    tabs: document.querySelectorAll('.tab-btn'),
    algoCheckboxes: document.querySelectorAll('.algo-checkbox'),
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', init);

async function init() {
    initTheme();
    initEventListeners();
    renderHistory();
    
    // Load crypto-js for MD5 fallback
    loadCryptoJS();
}

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

function initTheme() {
    if (STATE.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        DOM.themeToggle.textContent = '☀️';
    }
}

DOM.themeToggle.addEventListener('click', toggleTheme);

function toggleTheme() {
    STATE.theme = STATE.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', STATE.theme);
    localStorage.setItem('theme', STATE.theme);
    DOM.themeToggle.textContent = STATE.theme === 'dark' ? '☀️' : '🌙';
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function initEventListeners() {
    // Text input
    DOM.textInput.addEventListener('input', handleTextInput);
    DOM.clearText.addEventListener('click', clearText);
    
    // File input
    DOM.fileInput.addEventListener('change', handleFileSelect);
    DOM.dropZone.addEventListener('click', () => DOM.fileInput.click());
    DOM.dropZone.addEventListener('dragover', handleDragOver);
    DOM.dropZone.addEventListener('dragleave', handleDragLeave);
    DOM.dropZone.addEventListener('drop', handleFileDrop);
    
    // Tabs
    DOM.tabs.forEach(tab => {
        tab.addEventListener('click', handleTabChange);
    });
    
    // Algorithm selection
    DOM.algoCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleAlgoChange);
    });
    
    // Controls
    DOM.generateAll.addEventListener('click', generateAllHashes);
    DOM.uppercaseToggle.addEventListener('change', handleUppercaseChange);
    
    // History
    DOM.clearHistory.addEventListener('click', clearHistory);
    
    // Verification
    DOM.hashToCompare.addEventListener('input', handleVerificationInput);
}

// ============================================================================
// TEXT INPUT HANDLING
// ============================================================================

function handleTextInput(e) {
    STATE.currentInput = e.target.value;
    updateCharCount();
    generateHashes(STATE.currentAlgorithms);
}

function updateCharCount() {
    const count = STATE.currentInput.length;
    DOM.charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
}

function clearText() {
    DOM.textInput.value = '';
    STATE.currentInput = '';
    DOM.hashOutput.innerHTML = '<p class="empty-state">Select algorithms and enter text or upload a file to generate hashes</p>';
    updateCharCount();
}

// ============================================================================
// FILE HANDLING
// ============================================================================

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    DOM.dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    DOM.dropZone.classList.remove('drag-over');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    DOM.dropZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

async function processFile(file) {
    if (file.size > STATE.maxFileSize) {
        showError(`File size exceeds ${STATE.maxFileSize / 1024 / 1024}MB limit`);
        return;
    }
    
    STATE.selectedFile = file;
    DOM.fileInfo.textContent = `📄 ${file.name} (${formatFileSize(file.size)})`;
    
    try {
        const content = await readFile(file);
        STATE.currentInput = content;
        switchTab('text-input');
        generateHashes(STATE.currentAlgorithms);
    } catch (error) {
        showError(`Error reading file: ${error.message}`);
    }
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// TAB MANAGEMENT
// ============================================================================

function handleTabChange(e) {
    const tabBtn = e.currentTarget;
    const tabName = tabBtn.getAttribute('data-tab');
    switchTab(tabName);
}

function switchTab(tabName) {
    // Update buttons
    DOM.tabs.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).setAttribute('aria-selected', 'true');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
}

// ============================================================================
// ALGORITHM MANAGEMENT
// ============================================================================

function handleAlgoChange(e) {
    const checkbox = e.target;
    if (checkbox.checked) {
        if (!STATE.currentAlgorithms.includes(checkbox.value)) {
            STATE.currentAlgorithms.push(checkbox.value);
        }
    } else {
        STATE.currentAlgorithms = STATE.currentAlgorithms.filter(
            algo => algo !== checkbox.value
        );
    }
    
    if (STATE.currentInput) {
        generateHashes(STATE.currentAlgorithms);
    }
}

// ============================================================================
// HASH GENERATION
// ============================================================================

async function generateAllHashes() {
    const algorithms = Object.keys(ALGORITHMS);
    const previousChecked = [...DOM.algoCheckboxes]
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    // Check all
    DOM.algoCheckboxes.forEach(cb => cb.checked = true);
    STATE.currentAlgorithms = algorithms;
    
    if (STATE.currentInput) {
        await generateHashes(algorithms);
    }
}

async function generateHashes(algorithms) {
    if (!STATE.currentInput) {
        DOM.hashOutput.innerHTML = '<p class="empty-state">Select algorithms and enter text or upload a file to generate hashes</p>';
        return;
    }
    
    DOM.hashOutput.innerHTML = '<div class="spinner">Generating...</div>';
    
    try {
        const results = {};
        
        for (const algo of algorithms) {
            if (ALGORITHMS[algo]) {
                const hash = await computeHash(STATE.currentInput, algo);
                results[algo] = STATE.uppercase ? hash.toUpperCase() : hash;
            }
        }
        
        renderHashOutput(results);
        addToHistory(STATE.currentInput, results);
    } catch (error) {
        showError(`Error generating hashes: ${error.message}`);
    }
}

async function computeHash(input, algorithm) {
    try {
        if (algorithm === 'MD5') {
            return await hashMD5(input);
        } else if (algorithm === 'SHA-1') {
            return await hashSHA1(input);
        } else {
            return await hashWithSubtleCrypto(input, algorithm);
        }
    } catch (error) {
        console.error(`Error computing ${algorithm}:`, error);
        throw error;
    }
}

async function hashMD5(input) {
    // Check if CryptoJS is available
    if (typeof CryptoJS !== 'undefined' && CryptoJS.MD5) {
        return CryptoJS.MD5(input).toString();
    }
    
    // Fallback: simple warning
    throw new Error('MD5 library not available. Please wait for library to load.');
}

async function hashSHA1(input) {
    if (typeof CryptoJS !== 'undefined' && CryptoJS.SHA1) {
        return CryptoJS.SHA1(input).toString();
    }
    throw new Error('SHA-1 library not available');
}

async function hashWithSubtleCrypto(input, algorithm) {
    const algoMap = {
        'SHA-256': 'SHA-256',
        'SHA-384': 'SHA-384',
        'SHA-512': 'SHA-512',
    };
    
    const algo = algoMap[algorithm];
    if (!algo) throw new Error(`Unsupported algorithm: ${algorithm}`);
    
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest(algo, data);
    return bufferToHex(hashBuffer);
}

function bufferToHex(buffer) {
    const hashArray = Array.from(new Uint8Array(buffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// HASH OUTPUT RENDERING
// ============================================================================

function renderHashOutput(results) {
    if (Object.keys(results).length === 0) {
        DOM.hashOutput.innerHTML = '<p class="empty-state">No algorithms selected</p>';
        return;
    }
    
    const html = Object.entries(results)
        .map(([algo, hash]) => `
            <div class="hash-item">
                <div class="hash-item-content">
                    <div class="hash-algorithm">${algo}</div>
                    <div class="hash-value" id="hash-${algo}">${escapeHtml(hash)}</div>
                </div>
                <div class="hash-actions">
                    <button class="btn btn-primary btn-copy" data-hash="${algo}" data-value="${escapeHtml(hash)}" aria-label="Copy ${algo} hash">
                        📋 Copy
                    </button>
                </div>
            </div>
        `)
        .join('');
    
    DOM.hashOutput.innerHTML = html;
    
    // Attach copy listeners
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', handleCopyHash);
    });
}

function handleCopyHash(e) {
    const btn = e.currentTarget;
    const value = btn.getAttribute('data-value');
    const algo = btn.getAttribute('data-hash');
    
    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    const decodedValue = textarea.value;
    
    copyToClipboard(decodedValue, btn, algo);
}

async function copyToClipboard(text, btn, algo) {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        
        // Feedback
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    } catch (error) {
        showError('Failed to copy to clipboard');
    }
}

// ============================================================================
// HASH VERIFICATION
// ============================================================================

function handleVerificationInput(e) {
    const verifyHash = e.target.value.trim();
    const compareHash = DOM.hashToCompare.value.trim();
    
    if (!verifyHash || !compareHash) {
        DOM.verifyResult.classList.remove('show');
        return;
    }
    
    const normalized1 = normalizeHash(verifyHash);
    const normalized2 = normalizeHash(compareHash);
    
    const isMatch = normalized1 === normalized2;
    
    DOM.verifyResult.classList.add('show');
    DOM.verifyResult.className = 'verify-result show ' + (isMatch ? 'match' : 'mismatch');
    DOM.verifyResult.textContent = isMatch ? '✓ Hashes match!' : '✗ Hashes do not match';
}

function normalizeHash(hash) {
    return hash.toLowerCase().trim().replace(/\s/g, '');
}

// ============================================================================
// UPPERCASE TOGGLE
// ============================================================================

function handleUppercaseChange(e) {
    STATE.uppercase = e.target.checked;
    if (STATE.currentInput && STATE.currentAlgorithms.length > 0) {
        generateHashes(STATE.currentAlgorithms);
    }
}

// ============================================================================
// HISTORY MANAGEMENT
// ============================================================================

function addToHistory(input, results) {
    const historyItem = {
        input: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
        results,
        timestamp: new Date().toLocaleTimeString(),
    };
    
    STATE.history.unshift(historyItem);
    STATE.history = STATE.history.slice(0, 20); // Keep last 20
    localStorage.setItem('hashHistory', JSON.stringify(STATE.history));
    
    renderHistory();
}

function renderHistory() {
    if (STATE.history.length === 0) {
        DOM.historySection.style.display = 'none';
        return;
    }
    
    DOM.historySection.style.display = 'block';
    
    DOM.historyList.innerHTML = STATE.history
        .map((item, idx) => `
            <div class="history-item" role="button" tabindex="0" data-idx="${idx}">
                <span class="history-item-text">${escapeHtml(item.input)} • ${item.timestamp}</span>
            </div>
        `)
        .join('');
    
    // Attach listeners
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', handleHistoryClick);
        item.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleHistoryClick.call(item);
            }
        });
    });
}

function handleHistoryClick(e) {
    const idx = parseInt(this.getAttribute('data-idx'), 10);
    const historyItem = STATE.history[idx];
    
    if (historyItem) {
        DOM.textInput.value = historyItem.input;
        STATE.currentInput = historyItem.input;
        updateCharCount();
        renderHashOutput(historyItem.results);
        switchTab('text-input');
    }
}

function clearHistory() {
    if (confirm('Clear all history? This cannot be undone.')) {
        STATE.history = [];
        localStorage.removeItem('hashHistory');
        renderHistory();
    }
}

// ============================================================================
// CRYPTO-JS LOADER (MD5 & SHA-1)
// ============================================================================

function loadCryptoJS() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js';
    script.async = true;
    script.onload = () => {
        console.log('CryptoJS loaded successfully');
    };
    script.onerror = () => {
        console.warn('CryptoJS failed to load. MD5 and SHA-1 may not work.');
    };
    document.head.appendChild(script);
}

// ============================================================================
// UTILITIES
// ============================================================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = `⚠️ ${message}`;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f56565;
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

// ============================================================================
// ACCESSIBILITY
// ============================================================================

// Announce changes to screen readers
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.style.position = 'absolute';
    announcement.style.left = '-9999px';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
}

// ============================================================================
// KEYBOARD SHORTCUTS (Future Enhancement)
// ============================================================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Focus text input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        DOM.textInput.focus();
    }
});
