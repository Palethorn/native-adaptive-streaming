/**
 * Modifications copyright (C) 2017 David Ćavar
 */
var current_version = "0.8.2"

var btnUpdate = document.getElementById('btnUpdate');
btnUpdate.addEventListener('click', updateState);

chrome.runtime.sendMessage("getState", function(enabled){
    btnUpdate.innerText = enabled ? "Disable" :  "Enable";
});

function updateState() {
    chrome.runtime.sendMessage(btnUpdate.innerText);

    if (btnUpdate.innerText == "Enable") {
        btnUpdate.innerText = "Disable";
    } else {
        btnUpdate.innerText = "Enable";
    }

    window.close();
}

document.getElementById('btnSettings').addEventListener('click', function(){
	chrome.runtime.openOptionsPage();
});
