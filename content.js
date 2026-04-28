
var avatarState = {
  "close_mouth": chrome.runtime.getURL('assets/close_mouth.png'),
  "open_mouth": chrome.runtime.getURL('assets/open_mouth.png')
};


const popup = document.createElement('div');
popup.id = 'popcat-popup';
popup.innerHTML = `
  <img src="${avatarState.close_mouth}" alt="PopCat" id="popcat-image" width="100">
`;

if (document.body) {
  document.body.appendChild(popup);
}

// Escuchar mensajes desde el background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AUDIO_STATE_CHANGE') {
        const gatoImg = document.getElementById('popcat-image');
        if (message.isPlaying) {
            gatoImg.src = avatarState.open_mouth;
        } else {
            gatoImg.src = avatarState.close_mouth;
        }
    }
});


function toggleAvatar() {
    const gatoImg = document.getElementById('popcat-image');
    if (gatoImg.src === avatarState.close_mouth) {
        gatoImg.src = avatarState.open_mouth;
    } else {
        gatoImg.src = avatarState.close_mouth;
    }
}


async function onClick() {
    toggleAvatar();
}

document.getElementById('popcat-image').addEventListener('click', onClick);