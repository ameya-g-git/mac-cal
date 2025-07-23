import { generateICS } from "./generate_ics.js";

(() => {
  function handleMessage(request, sender, sendResponse) {
    if (request.start) {
      if (!window.location.href.match(/.*:\/\/mytimetable\.mcmaster\.ca.*/)) {
        // wrong url
        chrome.runtime.sendMessage({
          urlMatch: false,
          login: false,
        });
      } else if (
        document.body.className.includes("login_body") ||
        document
          .querySelector(".autho_text.header_invader_text_top")
          .innerText.includes("Guest")
      ) {
        // right url but not logged in
        chrome.runtime.sendMessage({
          urlMatch: true,
          login: false,
        });
      } else {
        chrome.runtime.sendMessage({
          urlMatch: true,
          login: true,
        });
      }
    }
    if (request.nameFormat && request.includeLoc)
      try {
        generateICS(request.nameFormat, request.includeLoc);
      } catch (e) {
        console.error(e);
      }
    return true;
  }

  if (!chrome.runtime.onMessage.hasListener(handleMessage))
    chrome.runtime.onMessage.addListener(handleMessage);
})();
