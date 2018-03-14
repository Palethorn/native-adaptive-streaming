/**
 * Modifications copyright (C) 2017 David Ćavar
 */
var current_version = "0.8.2"

var btnUpdate = document.getElementById('btnUpdate');
btnUpdate.addEventListener('click', updateState);

chrome.runtime.sendMessage("getState", function(enabled){
    btnUpdate.innerHTML = enabled ? "Disable" :  "Enable";
});

function updateState() {
    chrome.runtime.sendMessage(btnUpdate.innerHTML);

    if (btnUpdate.innerHTML == "Enable") {
        btnUpdate.innerHTML = "Disable";
    } else {
        btnUpdate.innerHTML = "Enable";
    }

    window.close();
}

document.getElementById('btnSettings').addEventListener('click', function(){
	chrome.runtime.openOptionsPage();
});
