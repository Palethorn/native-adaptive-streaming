/**
 * Modifications copyright (C) 2017 David Ćavar
 */
var hls_current_version = "0";
var dashjs_current_version = "0";

function save_options() {
  var hls_v = document.getElementById('hlsjsSel').value;
  var dash_v = document.getElementById('dashjsSel').value;
  var dbg = document.getElementById('cbDebug').checked;
  var ntv = document.getElementById('cbNative').checked;
  chrome.storage.local.set({
    hlsjs: hls_v,
    dashjs: dash_v,
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
    hlsjs: hls_current_version,
    dashjs: dashjs_current_version,
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
    if(!loaded1 || !loaded2) {
        return;
    }

    restore_options();
    document.getElementById('saveSettings').addEventListener('click', save_options);
}

$.ajax('https://data.jsdelivr.com/v1/package/npm/dashjs', {
    dataType: 'json',
    success: function(data) {
        loaded1 = true;
        dashjs_current_version = data.tags.latest;

        $.each(data.versions, function(i, version) {
            $("#dashjsSel").append($("<option />").text(version));
        });

        attachEventListeners();
    },
    error: function() {

    }
});

$.ajax('https://data.jsdelivr.com/v1/package/npm/hls.js', {
    dataType: 'json',
    success: function(data) {
        loaded2 = true;
        hls_current_version = data.tags.latest;

        $.each(data.versions, function(i, version) {
            $("#hlsjsSel").append($("<option />").text(version));
        });

        attachEventListeners();
    },
    error: function() {

    }
});
