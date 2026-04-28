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
}, 1000);