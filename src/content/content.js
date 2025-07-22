import { generateICS } from "./generate_ics.js";

(() => {
  let script = "";
  let cal;

  if (window.location.href.match(/.*:\/\/mytimetable\.mcmaster\.ca.*/)) {
    script = "content_scripts/parse_mytimetable.js";
  } else {
    // TODO: Idk throw an error or something
  }

  function handleMessage(request, sender, sendResponse) {
    if (request.nameFormat) generateICS(request.nameFormat, request.includeLoc);
    return true;
  }

  if (!browser.runtime.onMessage.hasListener(handleMessage))
    browser.runtime.onMessage.addListener(handleMessage);
})();
