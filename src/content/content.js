import { generateICS } from './generate_ics.js';

(() => {
  function handleMessage(request, sender, sendResponse) {
    if (request.start) {
      if (!window.location.href.match(/.*:\/\/mytimetable\.mcmaster\.ca.*/)) {
        // wrong url
        chrome.runtime.sendMessage({
          urlMatch: false,
          login: false,
          semSelected: false,
        });
      } else if (document.body.className.includes('login_body')) {
        // right url but not logged in
        chrome.runtime.sendMessage({
          urlMatch: true,
          login: false,
          semSelected: false,
        });
      } else if (
        // document.getElementById('welcomeTerms').style.display !== '' &&
        // document.getElementById('welcomeTerms').style.display !== 'none'
        document.querySelector('.reg_term').offsetParent !== null
      ) {
        chrome.runtime.sendMessage({
          urlMatch: true,
          login: true,
          semSelected: false,
        });
      } else {
        chrome.runtime.sendMessage({
          urlMatch: true,
          login: true,
          semSelected: true,
        });
      }
    }

    if (request.nameFormat && request.includeLoc)
      try {
        generateICS(request.nameFormat, request.includeLoc);
      } catch (e) {
        console.error(e);
        chrome.runtime.sendMessage({ error: e.message });
      }
  }

  if (!chrome.runtime.onMessage.hasListener(handleMessage))
    chrome.runtime.onMessage.addListener(handleMessage);
})();
