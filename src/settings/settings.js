async function verifyURL() {
  await browser.tabs
    .query({
      active: true,
      currentWindow: true,
    })
    .then((tabs) => {
      if (!tabs[0].url.match(/.*:\/\/mytimetable\.mcmaster\.ca/)) {
        document.getElementById("wrong-page-content").className = "";
        document.getElementById("popup-content").className = "hidden";
        throw new Error("Wrong website!");
      }
    });
  return;
}

function parseFormat(format) {
  let output = [];
  let specCode = "";
  let specifier = false; // whether or not we're currently parsing a specifier

  for (const char of format) {
    specifier ? (specCode += char) : output.push(char);
    if (char === "{") {
      output.pop();
      if (output[output.length - 1] === "\\") {
        output.pop();
        output.push("{");
        continue;
      }
      specifier = true;
    }

    if (char === "}") {
      specifier = false;
      specCode = specCode.slice(0, -1);

      if (!specCode) continue;

      switch (specCode) {
        case "code":
          output.push("MATH 1ZA3");
          break;
        case "type":
          output.push("LEC");
          break;
        case "sec":
          output.push("C01");
          break;
        case "room":
          output.push("PGCLL 127");
          break;
        default:
          output.push(`{${specCode}}`);
      }
      specCode = "";
    }
  }

  if (specifier) throw new SyntaxError("Curly brace not closed.");

  const outputStr = output.join("");

  return outputStr.length > 45 ? outputStr.slice(0, 42) + "..." : outputStr;
}

window.addEventListener("pageshow", () => {
  verifyURL();

  const formatSpec = document.getElementById("format-spec");
  const timeBlockTitle = document.getElementById("block-title");
  const infoModal = document.getElementById("format-info");
  const blockLocation = document.getElementById("block-loc");

  infoModal.addEventListener("mouseenter", (e) => {
    document.getElementById("modal").style.display = "block";
  });

  infoModal.addEventListener("mouseleave", () => {
    console.log("left");
    document.getElementById("modal").style.display = "none";
  });

  document.getElementById("room-loc").addEventListener("input", () => {
    document.getElementById("room-loc").checked
      ? (blockLocation.style.display = "block")
      : (blockLocation.style.display = "none");
  });

  document.querySelectorAll("#format-btns>*").forEach((elem) => {
    const [_, spec] = elem.id.split("-");

    elem.addEventListener("click", (e) => {
      e.preventDefault();
      formatSpec.value += `{${spec}} `;
      timeBlockTitle.innerText = parseFormat(formatSpec.value);
    });
  });

  formatSpec.addEventListener("input", (e) => {
    try {
      timeBlockTitle.innerText = parseFormat(formatSpec.value);
      document.getElementById("format-err").style.display = "none";
    } catch {
      document.getElementById("format-err").style.display = "inline-block";
    }
  });

  // TODO; fuck you fuck this fucking stupid piece of shit fucking javascript god i hatge this language and i hate everything about it
  // why the fuck are errors so fucking vague and they don't give any information abotu the actual fucking issue fucking god
  // nothing works and i donte ven have version control to revert to a version that works fuck this stupid fucking extension
  // fuck you fuck yoyu fuck youi

  // okay. i've restored it back to before i decided to delve into the hell of the sendMessage api.
  // i'm done for today. good fucking lord. least enjoyable programming session. sob

  document.getElementById("popup-content").addEventListener("submit", (e) => {
    console.log("sun,to");
    tabId = 0;
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(() => {
        browser.runtime.sendMessage({
          nameFormat: formatSpec.value,
          includeLoc: blockLocation.checked,
        });
      })
      .catch((e) => console.error(e));
  });
});
