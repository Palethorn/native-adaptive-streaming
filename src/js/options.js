/**
 * Modifications copyright (C) 2017 David Ćavar
 */

function save_options() {
  var dbg = document.getElementById('cbDebug').checked;
  var ntv = document.getElementById('cbNative').checked;
  chrome.storage.local.set({
    debug: dbg,
    native: ntv
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.local.get({
    debug: false,
    native: false
  }, function(items) {
    document.getElementById('hlsjsSel').value = items.hlsjs;
    document.getElementById('dashjsSel').value = items.dashjs;
    document.getElementById('cbDebug').checked = items.debug;
    document.getElementById('cbNative').checked = items.native;
  });
}

var loaded1 = false;
var loaded2 = false;

function attachEventListeners() {
    restore_options();
    document.getElementById('saveSettings').addEventListener('click', save_options);
}

attachEventListeners();