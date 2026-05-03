




// Escucha cuando una pestaña cambia su estado de audio
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.audible !== undefined) {
        // Envía un mensaje a todas las pestañas para actualizar el gato
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((t) => {
                chrome.tabs.sendMessage(t.id, {
                    type: 'AUDIO_STATE_CHANGE',
                    isPlaying: changeInfo.audible
                }).catch(() => {
                    // Ignorar errores (pestañas sin content script)
                });
            });
        });
    }
});

/*
setInterval(() => {
    chrome.tabs.query({ audible: true }, (audibleTabs) => {
        const hayAudio = audibleTabs.length > 0;
        chrome.tabs.query({}, (allTabs) => {
            allTabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'AUDIO_STATE_CHANGE',
                    isPlaying: hayAudio
                }).catch(() => {});
            });
        });
    });
}, 200);
*/
let volumeTargetTabId = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CAPTURE_AUDIO') {
        // Guardamos sendResponse para usarlo asincrónicamente
        (async () => {
            try {
                const activeTabId = sender?.tab?.id;
                if (!activeTabId) {
                    throw new Error('No se pudo determinar la pestaña solicitante');
                }

                volumeTargetTabId = activeTabId;

                // Solicitar streamId
                const streamId = await chrome.tabCapture.getMediaStreamId({
                    targetTabId: activeTabId
                });

                // Asegurar offscreen document
                let offscreenExists = await chrome.offscreen.hasDocument();
                if (!offscreenExists) {
                    await chrome.offscreen.createDocument({
                        url: 'offscreen.html',
                        reasons: ['USER_MEDIA'],
                        justification: 'Capturar audio de la pestaña'
                    });
                }

                // Enviar streamId al offscreen
                chrome.runtime.sendMessage({
                    type: 'START_RECORDING',
                    streamId: streamId
                });

                // Responder al content script que todo está bien
                sendResponse({ success: true });
            } catch (error) {
                console.error("Error en background:", error);
                sendResponse({ error: error.message });
            }
        })();
        return true; 
    }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AUDIO_VOLUME') {
        console.log("Volumen recibido:", message.volume);
        if (typeof volumeTargetTabId === 'number') {
            chrome.tabs.sendMessage(volumeTargetTabId, {
                type: 'AUDIO_VOLUME',
                volume: message.volume
            }).catch(() => {});
        }
    }
});

