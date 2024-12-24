// Typing configuration with default values
let typingConfig = {
  baseSpeed: 150, // Base typing speed in ms
  randomization: 0.5, // 0-1, how random the typing speed should be
  spaceDelay: 1.5, // Multiplier for delay after space
  strategy: 'natural' // 'natural', 'uniform', or 'punctuated'
};

// Flag to track if typing is in progress
let isTyping = false;

// Load configuration from storage
chrome.storage.sync.get(['typingConfig'], (result) => {
  if (result.typingConfig) {
    typingConfig = { ...typingConfig, ...result.typingConfig };
  }
});

// Calculate delay based on character and strategy
function getTypingDelay(char, prevChar = '') {
  let delay = typingConfig.baseSpeed;
  
  switch (typingConfig.strategy) {
    case 'uniform':
      return delay;
    case 'punctuated':
      if (char === ' ' || char === '.' || char === ',' || char === '!' || char === '?') {
        return delay * typingConfig.spaceDelay;
      }
      return delay;
    case 'natural':
    default:
      // Add randomization
      delay *= 1 + (Math.random() * 2 - 1) * typingConfig.randomization;
      
      // Add delay for spaces and punctuation
      if (char === ' ' || char === '.' || char === ',' || char === '!' || char === '?') {
        delay *= typingConfig.spaceDelay;
      }
      
      // Add delay for character combinations that are typically slower to type
      if (prevChar && isAwkwardCombination(prevChar, char)) {
        delay *= 1.3;
      }
      
      return delay;
  }
}

// Check if two characters form an awkward combination to type
function isAwkwardCombination(char1, char2) {
  // Define some common awkward combinations
  const awkwardPairs = [
    ['t', 'h'], ['f', 'j'], ['g', 'h'], ['m', 'n'],
    ['b', 'n'], ['c', 'v'], ['x', 'z'], ['q', 'w']
  ];
  
  return awkwardPairs.some(([c1, c2]) => 
    (char1.toLowerCase() === c1 && char2.toLowerCase() === c2) ||
    (char1.toLowerCase() === c2 && char2.toLowerCase() === c1)
  );
}

// Handle focus loss
function handleFocusLoss() {
  if (isTyping) {
    isTyping = false;
  }
}

// Simulate typing the text
async function simulateTyping(text) {
  const activeElement = document.activeElement;
  if (!activeElement) return;

  // Check if the element is editable
  const isEditable = activeElement.isContentEditable || 
    activeElement.tagName === 'INPUT' || 
    activeElement.tagName === 'TEXTAREA';
  
  if (!isEditable) return;

  // Set typing flag
  isTyping = true;
  
  // Add focus loss listener
  activeElement.addEventListener('blur', handleFocusLoss);

  // Split text into characters
  const chars = text.split('');
  let prevChar = '';
  
  for (const char of chars) {
    // Check if typing should continue
    if (!isTyping) break;

    // Create and dispatch keyboard events
    const keydownEvent = new KeyboardEvent('keydown', {
      key: char,
      code: `Key${char.toUpperCase()}`,
      bubbles: true,
      cancelable: true,
    });
    
    const inputEvent = new InputEvent('input', {
      data: char,
      inputType: 'insertText',
      bubbles: true,
      cancelable: true,
    });
    
    const keyupEvent = new KeyboardEvent('keyup', {
      key: char,
      code: `Key${char.toUpperCase()}`,
      bubbles: true,
      cancelable: true,
    });

    // If it's an input or textarea, we need to insert the text directly
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      const currentValue = activeElement.value;
      activeElement.value = currentValue.substring(0, start) + char + currentValue.substring(end);
      activeElement.selectionStart = activeElement.selectionEnd = start + 1;
    } else {
      // For contenteditable elements
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(char);
      range.deleteContents();
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    activeElement.dispatchEvent(keydownEvent);
    activeElement.dispatchEvent(inputEvent);
    activeElement.dispatchEvent(keyupEvent);

    // Wait for calculated delay before next character
    await new Promise(resolve => setTimeout(resolve, getTypingDelay(char, prevChar)));
    prevChar = char;
  }

  // Remove focus loss listener
  activeElement.removeEventListener('blur', handleFocusLoss);
  isTyping = false;
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'paste-type') {
    try {
      const text = await navigator.clipboard.readText();
      await simulateTyping(text);
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error:', error);
      sendResponse({ success: false, error: error.message });
    }
  } else if (request.action === 'update-config') {
    typingConfig = { ...typingConfig, ...request.config };
    sendResponse({ success: true });
  }
  return true; // Keep the message channel open for async response
}); 