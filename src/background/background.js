async function getCurrentTab() {
  return chrome.tabs.query({ active: true, currentWindow: true });
}

chrome.runtime.onMessage.addListener((req) => {
  console.log(req);

  tabId = 0;

  if (req.nameFormat)
    getCurrentTab()
      .then((tabs) => {
        return (tabId = tabs[0].id);
      })
      .then((tabId) =>
        chrome.tabs.sendMessage(tabId, {
          nameFormat: req.nameFormat,
        }),
      )
      .then(() => console.log("sent message"))
      .catch((e) => {
        console.log(
          "content script not installed, installing and sending message",
        );
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["../content/content.js"],
        });
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, {
            ...req,
          });
        }, 100);
      });
});
