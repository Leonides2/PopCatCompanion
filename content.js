const popup = document.createElement('div');
popup.id = 'popcat-popup';
popup.innerHTML = `
  <img src="${chrome.runtime.getURL('assets/close_mouth.png')}" alt="PopCat" id="popcat-image" width="100">
`;

if (document.body) {
  document.body.appendChild(popup);
}

// Escuchar mensajes desde el background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AUDIO_STATE_CHANGE') {
        const gatoImg = document.getElementById('popcat-image');
        if (message.isPlaying) {
            gatoImg.src = chrome.runtime.getURL('assets/open_mouth.png');
        } else {
            gatoImg.src = chrome.runtime.getURL('assets/close_mouth.png');
        }
    }
});