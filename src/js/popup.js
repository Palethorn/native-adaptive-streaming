/**
 * Modifications copyright (C) 2017 David Ćavar
 */
var current_version = "0.8.2"

var btnUpdate = document.getElementById('btnUpdate');
btnUpdate.addEventListener('click', updateState);

chrome.runtime.sendMessage("getState", function(enabled){
    btnUpdate.innerText = enabled ? 'DISABLE' :  'ENABLE';
});

function updateState() {
    chrome.runtime.sendMessage(btnUpdate.innerText);
    
    if (btnUpdate.innerText == 'ENABLE') {
        btnUpdate.innerText = 'DISABLE';
    } else {
        btnUpdate.innerText = 'ENABLE';
    }

    window.close();
}

document.getElementById('btnSettings').addEventListener('click', function(){
	chrome.runtime.openOptionsPage();
});
