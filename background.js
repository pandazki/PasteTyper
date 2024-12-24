// Listen for the keyboard command
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'paste-type') {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    try {
      // Send message to content script
      await chrome.tabs.sendMessage(tab.id, { action: 'paste-type' });
    } catch (error) {
      console.error('Error sending message to content script:', error);
    }
  }
});

// Open options page when extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
}); 