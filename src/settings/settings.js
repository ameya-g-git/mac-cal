async function verifyURL() {
  await chrome.tabs
    .query({
      active: true,
      currentWindow: true,
    })
    .then((tabs) => {
      const { url } = tabs[0];
      if (!url.match(/.*:\/\/mytimetable\.mcmaster\.ca/)) {
        document.getElementById('popup-content').style.display = 'none';
        document.getElementById('wrong-page-content').style.display = 'flex';
        throw new Error('Wrong website!');
      }
    });
}

function parseFormat(format) {
  let output = [];
  let specCode = '';
  let specifier = false; // whether or not we're currently parsing a specifier

  for (const char of format) {
    specifier ? (specCode += char) : output.push(char);
    if (char === '{') {
      output.pop();
      if (output[output.length - 1] === '\\') {
        output.pop();
        output.push('{');
        continue;
      }
      specifier = true;
    }

    if (char === '}') {
      specifier = false;
      specCode = specCode.slice(0, -1);

      if (!specCode) continue;

      switch (specCode) {
        case 'code':
          output.push('MATH 1ZA3');
          break;
        case 'type':
          output.push('LEC');
          break;
        case 'sec':
          output.push('C01');
          break;
        case 'room':
          output.push('PGCLL 127');
          break;
        default:
          output.push(`{${specCode}}`);
      }
      specCode = '';
    }
  }

  if (specifier) throw new SyntaxError('Curly brace not closed.');

  const outputStr = output.join('');

  return outputStr.length > 45 ? outputStr.slice(0, 42) + '...' : outputStr;
}

let contentState = {
  urlMatch: false,
  login: false,
  semSelected: false,
};

let error = null;

function handleMessage(request) {
  console.log('settings', request);
  if (!request.popup) return false;

  if ('urlMatch' in request && 'login' in request && 'semSelected' in request)
    contentState = { ...request };
  else if ('error' in request) {
    error = request.error;
  } else {
    return false;
  }
}

window.addEventListener('pageshow', () => {
  verifyURL().then(() => chrome.runtime.sendMessage({ start: true }));

  if (!chrome.runtime.onMessage.hasListener(handleMessage))
    chrome.runtime.onMessage.addListener(handleMessage);

  const formatSpec = document.getElementById('format-spec');
  const timeBlockTitle = document.getElementById('block-title');
  const infoModal = document.getElementById('format-info');
  const blockLocation = document.getElementById('block-loc');
  const roomLoc = document.getElementById('room-loc');

  setInterval(() => {
    const disclaimer = document.getElementById('disclaimer');
    if (!contentState.login || !contentState.semSelected) {
      document.querySelectorAll('input, button').forEach((elem) => {
        elem.disabled = true;
      });

      if (!contentState.login) disclaimer.innerText = '(sign in first!)';
      else if (!contentState.semSelected)
        disclaimer.innerText = '(select a semester!)';

      disclaimer.style.display = 'block';
    } else {
      document.querySelectorAll('input, button').forEach((elem) => {
        elem.disabled = false;
      });
      disclaimer.style.display = 'none';
    }

    if (error !== null && error.length > 0) {
      document.getElementById('error').innerText = 'Error occurred. ' + error;
      document.getElementById('error').style.display = 'block';
    } else {
      document.getElementById('error').style.display = 'none';
    }
  }, 16);

  infoModal.addEventListener('mouseenter', () => {
    document.getElementById('modal').style.display = 'block';
  });

  infoModal.addEventListener('focus', () => {
    document.getElementById('modal').style.display = 'block';
  });

  infoModal.addEventListener('mouseleave', () => {
    document.getElementById('modal').style.display = 'none';
  });
  infoModal.addEventListener('blur', () => {
    document.getElementById('modal').style.display = 'none';
  });

  roomLoc.addEventListener('input', () => {
    roomLoc.checked
      ? (blockLocation.style.display = 'flex')
      : (blockLocation.style.display = 'none');
  });

  document.querySelectorAll('#format-btns>*').forEach((elem) => {
    const [_, spec] = elem.id.split('-');

    elem.addEventListener('click', (e) => {
      e.preventDefault();
      formatSpec.value += `{${spec}} `;
      timeBlockTitle.innerText = parseFormat(formatSpec.value);
      timeBlockTitle.focus();
    });
  });

  formatSpec.addEventListener('input', () => {
    try {
      timeBlockTitle.innerText = parseFormat(formatSpec.value);
      document.getElementById('format-err').style.display = 'none';
    } catch {
      document.getElementById('format-err').style.display = 'inline-block';
    }
  });

  document.getElementById('popup-content').addEventListener('submit', (e) => {
    e.preventDefault();
    chrome.tabs
      .query({ active: true, currentWindow: true })
      .then(() => {
        chrome.runtime.sendMessage({
          nameFormat: formatSpec.value,
          includeLoc: roomLoc.checked,
        });
      })
      .catch((err) => console.error(err));
  });
});
