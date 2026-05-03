// offscreen.js
let audioContext = null;
let source = null;
let volumeIntervalId = null;

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type === 'START_RECORDING') {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    mandatory: {
                        chromeMediaSource: "tab",
                        chromeMediaSourceId: message.streamId,
                        suppressLocalAudioPlayback: false
                    }
                },
                video: false
            });

            audioContext = new AudioContext();
            source = audioContext.createMediaStreamSource(stream);
            
            // Conectar a un analizador para obtener el volumen
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            source.connect(audioContext.destination);

            const dataArray = new Float32Array(analyser.fftSize);

            if (volumeIntervalId) {
                clearInterval(volumeIntervalId);
                volumeIntervalId = null;
            }

            await audioContext.resume();

            // requestAnimationFrame suele ser throttled en offscreen; usamos setInterval.
            volumeIntervalId = setInterval(() => {
                if (!analyser) return;

                analyser.getFloatTimeDomainData(dataArray);

                // RMS para volumen (0..~1)
                let sumSquares = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    const v = dataArray[i];
                    sumSquares += v * v;
                }
                const rms = Math.sqrt(sumSquares / dataArray.length);

                chrome.runtime.sendMessage({
                    type: 'AUDIO_VOLUME',
                    volume: rms
                });
            }, 50);
            
            console.log("Stream capturado, analizando volumen...");
        } catch (err) {
            console.error("Error al capturar stream en offscreen:", err);
        }
    }
});

// Limpiar cuando el offscreen se cierre
window.addEventListener('beforeunload', () => {
    if (volumeIntervalId) clearInterval(volumeIntervalId);
    if (audioContext) audioContext.close();
});