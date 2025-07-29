async function getCurrentTab() {
  return chrome.tabs.query({ active: true, currentWindow: true });
}

async function sendContentMessage(message) {
  let tabId = 0;

  getCurrentTab()
    .then((tabs) => {
      return (tabId = tabs[0].id);
    })
    .then((tabId) => chrome.tabs.sendMessage(tabId, message))
    .then(() => console.log('sent message', message))
    .catch((_) => {
      console.log(
        'content script not installed, installing and sending message',
      );
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content/content.js'],
      });
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, message);
      }, 100);
    });
}

chrome.runtime.onMessage.addListener((req) => {
  if ((req.nameFormat && req.includeLoc) || req.start) {
    sendContentMessage(req);
  }

  if (
    (('urlMatch' in req && 'login' in req && 'semSelected' in req) || // webpage check
      'error' in req) && // submission check
    !req.popup // make sure the message is meant for the popup
  ) {
    setTimeout(() => chrome.runtime.sendMessage({ ...req, popup: true }), 100);
  }
});
