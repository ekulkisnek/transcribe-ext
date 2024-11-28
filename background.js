async function ensureOffscreenDocument(streamId) {
    const offscreenUrl = 'offscreen.html';

    // Check if the offscreen document already exists
    const existingClients = await clients.matchAll();
    for (const client of existingClients) {
        if (client.url.includes(offscreenUrl)) {
            // If it exists, send the streamId to it
            client.postMessage({ command: 'start-capture', streamId });
            return;
        }
    }

    // Create the offscreen document
    await chrome.offscreen.createDocument({
        url: offscreenUrl,
        reasons: [chrome.offscreen.Reason.MEDIA],
        justification: 'Needed for tab audio capture and processing.'
    });

    // After creation, get the new client and send the streamId
    setTimeout(async () => {
        const newClients = await clients.matchAll();
        for (const client of newClients) {
            if (client.url.includes(offscreenUrl)) {
                client.postMessage({ command: 'start-capture', streamId });
                break;
            }
        }
    }, 1000); // Delay to ensure the offscreen document is ready
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "start-capture") {
        console.log("Received start-capture command for tabId:", message.tabId);
        startCapture(message.tabId).then(() => {
            sendResponse({ status: "Capture started" });
        }).catch((error) => {
            console.error("Error starting capture:", error);
            sendResponse({ status: "Error: " + error.message });
        });
        return true; // Indicates asynchronous response
    }
});

async function startCapture(tabId) {
    try {
        if (!tabId) throw new Error("No tab ID provided.");

        console.log("Querying tab with ID:", tabId);
        const tab = await chrome.tabs.get(tabId);
        if (!tab) throw new Error("Tab not found.");

        console.log("Requesting desktop capture for tab:", tab);
        const streamId = await new Promise((resolve, reject) => {
            chrome.desktopCapture.chooseDesktopMedia(
                ["tab", "audio"],
                tab,
                (streamId) => {
                    if (chrome.runtime.lastError || !streamId) {
                        const errorMessage = chrome.runtime.lastError
                            ? chrome.runtime.lastError.message
                            : "User canceled the request.";
                        console.error("Error in chooseDesktopMedia:", errorMessage);
                        reject(new Error(errorMessage));
                    } else {
                        console.log("Stream ID obtained:", streamId);
                        resolve(streamId);
                    }
                }
            );
        });

        console.log("Obtaining media stream with streamId:", streamId);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: "desktop",
                    chromeMediaSourceId: streamId
                }
            },
            video: false
        });

        console.log("Captured audio stream:", stream);
        // Process the stream as needed
    } catch (error) {
        console.error("Error in startCapture:", error);
        throw error;
    }
} 