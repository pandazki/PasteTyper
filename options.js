// Default configuration
const defaultConfig = {
  baseSpeed: 30,
  randomization: 0.5,
  spaceDelay: 3,
  strategy: 'natural'
};

// Sample text for preview
const sampleText = "The quick brown fox jumps over the lazy dog!\nHow vexingly quick daft zebras jump.\nThe five boxing wizards jump quickly.";

// Current configuration (used for preview)
let currentConfig = { ...defaultConfig };

// Preview state
let isPlaying = false;
let currentIndex = 0;
let previewTimeout = null;

// DOM Elements
const elements = {
  form: document.getElementById('settingsForm'),
  strategy: document.getElementById('strategy'),
  baseSpeed: document.getElementById('baseSpeed'),
  baseSpeedValue: document.getElementById('baseSpeedValue'),
  randomization: document.getElementById('randomization'),
  randomizationValue: document.getElementById('randomizationValue'),
  spaceDelay: document.getElementById('spaceDelay'),
  spaceDelayValue: document.getElementById('spaceDelayValue'),
  saveButton: document.getElementById('saveButton'),
  resetButton: document.getElementById('resetButton'),
  playButton: document.getElementById('playButton'),
  pauseButton: document.getElementById('pauseButton'),
  demoOutput: document.getElementById('demoOutput'),
  previewStatus: document.getElementById('previewStatus'),
  status: document.getElementById('status')
};

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get(['typingConfig'], (result) => {
    const config = result.typingConfig || defaultConfig;
    currentConfig = { ...config };
    
    updateFormValues(config);
  });
}

// Update form values
function updateFormValues(config) {
  elements.strategy.value = config.strategy;
  elements.baseSpeed.value = config.baseSpeed;
  elements.baseSpeedValue.textContent = `${config.baseSpeed}ms`;
  elements.randomization.value = config.randomization * 100;
  elements.randomizationValue.textContent = `${config.randomization * 100}%`;
  elements.spaceDelay.value = config.spaceDelay * 100;
  elements.spaceDelayValue.textContent = `${config.spaceDelay}x`;
}

// Get current form values
function getFormValues() {
  return {
    strategy: elements.strategy.value,
    baseSpeed: parseInt(elements.baseSpeed.value),
    randomization: parseInt(elements.randomization.value) / 100,
    spaceDelay: parseInt(elements.spaceDelay.value) / 100
  };
}

// Save settings
function saveSettings(e) {
  e?.preventDefault();
  
  const config = getFormValues();
  
  chrome.storage.sync.set({ typingConfig: config }, () => {
    currentConfig = { ...config };
    showStatus('Settings saved!', 'success');
  });
}

// Reset settings
function resetSettings(e) {
  e?.preventDefault();
  
  updateFormValues(defaultConfig);
  currentConfig = { ...defaultConfig };
  restartPreview();
}

// Show status message
function showStatus(message, type) {
  elements.status.textContent = message;
  elements.status.className = `status ${type}`;
  setTimeout(() => {
    elements.status.className = 'status';
  }, 3000);
}

// Check for awkward character combinations
function isAwkwardCombination(char1, char2) {
  const awkwardPairs = [
    ['t', 'h'], ['f', 'j'], ['g', 'h'], ['m', 'n'],
    ['b', 'n'], ['c', 'v'], ['x', 'z'], ['q', 'w']
  ];
  
  return awkwardPairs.some(([c1, c2]) => 
    (char1.toLowerCase() === c1 && char2.toLowerCase() === c2) ||
    (char1.toLowerCase() === c2 && char2.toLowerCase() === c1)
  );
}

// Calculate typing delay
function getTypingDelay(char, prevChar = '') {
  let delay = currentConfig.baseSpeed;
  
  switch (currentConfig.strategy) {
    case 'uniform':
      return delay;
    case 'punctuated':
      if (char === ' ' || char === '.' || char === ',' || char === '!' || char === '?') {
        return delay * currentConfig.spaceDelay;
      }
      return delay;
    case 'natural':
    default:
      delay *= 1 + (Math.random() * 2 - 1) * currentConfig.randomization;
      if (char === ' ' || char === '.' || char === ',' || char === '!' || char === '?') {
        delay *= currentConfig.spaceDelay;
      }
      if (prevChar && isAwkwardCombination(prevChar, char)) {
        delay *= 1.3;
      }
      return delay;
  }
}

// Preview typing
async function typeNextCharacter() {
  if (!isPlaying || currentIndex >= sampleText.length) {
    if (currentIndex >= sampleText.length) {
      stopPreview();
    }
    return;
  }

  const char = sampleText[currentIndex];
  const prevChar = currentIndex > 0 ? sampleText[currentIndex - 1] : '';
  
  // Split the text into typed and untyped parts
  const typedText = sampleText.substring(0, currentIndex);
  const currentChar = sampleText[currentIndex];
  const untypedText = sampleText.substring(currentIndex + 1);
  
  elements.demoOutput.innerHTML = 
    escapeHtml(typedText) +
    '<span class="cursor">' + escapeHtml(currentChar) + '</span>' +
    escapeHtml(untypedText);
  
  currentIndex++;
  
  const delay = getTypingDelay(char, prevChar);
  previewTimeout = setTimeout(typeNextCharacter, delay);
}

// Helper function to escape HTML special characters
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Start preview
function startPreview() {
  isPlaying = true;
  elements.playButton.disabled = true;
  elements.pauseButton.disabled = false;
  elements.previewStatus.textContent = 'Playing';
  elements.previewStatus.className = 'preview-status playing';
  typeNextCharacter();
}

// Pause preview
function pausePreview() {
  isPlaying = false;
  elements.playButton.disabled = false;
  elements.pauseButton.disabled = true;
  elements.previewStatus.textContent = 'Paused';
  elements.previewStatus.className = 'preview-status paused';
  if (previewTimeout) {
    clearTimeout(previewTimeout);
  }
}

// Stop preview
function stopPreview() {
  isPlaying = false;
  elements.playButton.disabled = false;
  elements.pauseButton.disabled = true;
  elements.previewStatus.textContent = 'Ready';
  elements.previewStatus.className = 'preview-status';
  if (previewTimeout) {
    clearTimeout(previewTimeout);
  }
}

// Restart preview
function restartPreview() {
  stopPreview();
  currentIndex = 0;
  elements.demoOutput.textContent = sampleText;
  startPreview();
}

// Form input handlers
elements.strategy.addEventListener('change', () => {
  currentConfig.strategy = elements.strategy.value;
  restartPreview();
});

elements.baseSpeed.addEventListener('input', () => {
  elements.baseSpeedValue.textContent = `${elements.baseSpeed.value}ms`;
  currentConfig.baseSpeed = parseInt(elements.baseSpeed.value);
  restartPreview();
});

elements.randomization.addEventListener('input', () => {
  elements.randomizationValue.textContent = `${elements.randomization.value}%`;
  currentConfig.randomization = parseInt(elements.randomization.value) / 100;
  restartPreview();
});

elements.spaceDelay.addEventListener('input', () => {
  elements.spaceDelayValue.textContent = `${parseInt(elements.spaceDelay.value) / 100}x`;
  currentConfig.spaceDelay = parseInt(elements.spaceDelay.value) / 100;
  restartPreview();
});

// Button handlers
elements.form.addEventListener('submit', saveSettings);
elements.form.addEventListener('reset', resetSettings);
elements.playButton.addEventListener('click', startPreview);
elements.pauseButton.addEventListener('click', pausePreview);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  elements.demoOutput.textContent = sampleText;
}); 