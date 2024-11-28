document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("start-capture").addEventListener("click", async () => {
        try {
            console.log("Start Capture button clicked.");
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) throw new Error("No active tab found.");

            console.log("Sending start-capture message for tabId:", tab.id);
            chrome.runtime.sendMessage({ command: "start-capture", tabId: tab.id }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError.message);
                    alert("Error: " + chrome.runtime.lastError.message);
                } else if (response.status.startsWith("Error")) {
                    console.error("Response error:", response.status);
                    alert(response.status);
                } else {
                    console.log("Response status:", response.status);
                }
            });
        } catch (error) {
            console.error("Error in popup:", error);
            alert("Error: " + error.message);
        }
    });
});
