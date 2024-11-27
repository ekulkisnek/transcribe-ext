document.addEventListener('DOMContentLoaded', function() {
    console.log('Popup loaded!');

    document.getElementById('sendMessage').addEventListener('click', function() {
        chrome.runtime.sendMessage({ message: "popup_button_clicked" }, function(response) {
            console.log(response.response);
        });
    });
});
