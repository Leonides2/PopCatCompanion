
var avatarState = {
    "close_mouth": chrome.runtime.getURL('assets/close_mouth.png'),
    "open_mouth": chrome.runtime.getURL('assets/open_mouth.png')
};

createdOverlay();

const gatoImg = document.getElementById('popcat-image');
const contextMenu = document.getElementById('popcat-context-menu');
const hideBtn = document.getElementById('popcat-context-menu-hide');
const traceBtn = document.getElementById('popcat-context-menu-trace');

if (gatoImg) {
    gatoImg.addEventListener('click', () => onClick());
}

if (hideBtn) {
    hideBtn.addEventListener('click', () => toggleContextMenu());
}

if (traceBtn) {
    traceBtn.addEventListener('click', captureStream);
}

// Escuchar mensajes desde el background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === 'AUDIO_STATE_CHANGE') {
        const gatoImg = document.getElementById('popcat-image');

        if (!gatoImg) {
            console.log('Elemento popcat-image no encontrado o aún no cargado');
            return;
        }


        gatoImg.src = avatarState.close_mouth;
        gatoImg.dataset.popcatState = 'close';
    }

    if (message.type === 'AUDIO_VOLUME') {
        handleAudioVolume(message.volume);
    }
});

async function captureStream() {
    // Enviamos el mensaje al background para iniciar la captura
    chrome.runtime.sendMessage({ type: 'CAPTURE_AUDIO' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error al enviar mensaje:", chrome.runtime.lastError);
            return;
        }
        if (response && response.success) {
            console.log("Captura de audio iniciada correctamente");
        } else if (response && response.error) {
            console.error("Error en la captura:", response.error);
        }
    });
}



window.addEventListener('mousemove', function (e) {
    if (!getContextOpenState()) {
        document.documentElement.style.setProperty('--popcat-context-menu-top', e.clientY + 'px');
        document.documentElement.style.setProperty('--popcat-context-menu-right', (window.innerWidth - e.clientX) + 'px');
    }
});

let isMouthOpenByVolume = false;
let lastToggleAt = 0;
const VOLUME_OPEN_THRESHOLD = 0.12;
const VOLUME_CLOSE_THRESHOLD = 0.06;
const MIN_TOGGLE_INTERVAL_MS = 80;

function handleAudioVolume(rawVolume) {
    const gatoImg = document.getElementById('popcat-image');
    if (!gatoImg) return;

    const volume = typeof rawVolume === 'number' ? rawVolume : 0;
    const now = Date.now();
    if (now - lastToggleAt < MIN_TOGGLE_INTERVAL_MS) return;

    if (!isMouthOpenByVolume && volume >= VOLUME_OPEN_THRESHOLD) {
        if (gatoImg.src !== avatarState.open_mouth) toggleAvatar();
        isMouthOpenByVolume = true;
        lastToggleAt = now;
        return;
    }

    if (isMouthOpenByVolume && volume <= VOLUME_CLOSE_THRESHOLD) {
        if (gatoImg.src !== avatarState.close_mouth) toggleAvatar();
        isMouthOpenByVolume = false;
        lastToggleAt = now;
    }
}



function createdOverlay() {

    const overlay = document.createElement('div');
    overlay.id = 'popcat-popup';

    const img = document.createElement('img');
    img.src = avatarState.close_mouth;
    img.alt = 'PopCat';
    img.id = 'popcat-image';
    img.width = 100;
    img.dataset.popcatState = 'close';


    const contextMenu = document.createElement('div');
    contextMenu.id = 'popcat-context-menu';
    contextMenu.className = 'popcat-context-menu';
    contextMenu.style.display = 'none';
    contextMenu.innerHTML = `
        <button id="popcat-context-menu-hide"> Hide </button>
        <button id="popcat-context-menu-trace"> Trace this tab audio </button>
    `;

    overlay.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        toggleContextMenu();
    });

    overlay.appendChild(img);
    overlay.appendChild(contextMenu);

    document.body.appendChild(overlay);
}

