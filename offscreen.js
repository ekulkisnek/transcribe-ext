// Listen for messages from the service worker
self.onmessage = async (event) => {
    const message = event.data;
    if (message.command === 'start-capture') {
        const streamId = message.streamId;
        console.log("Received streamId in offscreen document:", streamId);
        try {
            await startCapture(streamId);
        } catch (error) {
            console.error("Error in offscreen document:", error);
            // Optionally, send error back to service worker
            chrome.runtime.sendMessage({ command: "display-error", error: error.message });
        }
    }
};

async function startCapture(streamId) {
    try {
        // Use the streamId to get the MediaStream
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId
                }
            },
            video: false
        });

        console.log("Tab audio stream captured in offscreen document:", stream);

        // Proceed to process the audio stream
        processAudioStream(stream);
    } catch (error) {
        console.error("Error in startCapture:", error);
        throw error;
    }
}

function processAudioStream(stream) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(audioContext.destination);

    // Continue with your audio processing...
    console.log("Audio processing started in offscreen document.");

    // For example, you can perform transcription here
    // Simulate transcription result
    setTimeout(() => {
        const transcription = "Simulated transcription result.";
        console.log("Transcription complete:", transcription);
        // Send the result back to the service worker
        chrome.runtime.sendMessage({ command: "transcription-result", transcription });
    }, 5000);
} 