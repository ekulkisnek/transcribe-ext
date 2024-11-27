chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "popup_button_clicked") {
        console.log("Message received from popup!");
        sendResponse({ response: "Background script received the message." });
    }
}); 