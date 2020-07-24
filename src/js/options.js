/**
 * Modifications copyright (C) 2017 David Ćavar
 */

function save_options() {
  // {% if (env['target'] == 'chrome') or  (env['target'] == 'self_hosted') %}
  
  var hlsjs_version = document.getElementById('hlsjsSel').value;
  var dashjs_version = document.getElementById('dashjsSel').value;
  // {% endif %}

  var dbg = document.getElementById('cbDebug').checked;
  var maxQuality = document.getElementById('maxQuality').checked;
  var video_native_mode = document.getElementById('video-native-mode').checked;

  chrome.storage.local.set({
    // {% if (env['target'] == 'chrome') or  (env['target'] == 'self_hosted') %}
    
    hlsjs_version: hlsjs_version,
    dashjs_version: dashjs_version,
    // {% endif %}

    debug: dbg,
    maxQuality: maxQuality,
    video_native_mode: video_native_mode
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
    // {% if (env['target'] == 'chrome') or  (env['target'] == 'self_hosted') %}
    
    hlsjs_version: '0.14.0',
    dashjs_version: '3.1.1',
    // {% endif %}

    debug: false,
    maxQuality: false,
    video_native_mode: false
  }, function(items) {
    document.getElementById('hlsjsSel').value = items.hlsjs_version;
    document.getElementById('dashjsSel').value = items.dashjs_version;
    document.getElementById('cbDebug').checked = items.debug;
    document.getElementById('maxQuality').checked = items.maxQuality;
    document.getElementById('video-native-mode').checked = items.video_native_mode
  });
}

var loaded1 = false;
var loaded2 = false;

function attachEventListeners() {
    // {% if (env['target'] == 'chrome') or  (env['target'] == 'self_hosted') %}
    
    if(!loaded1 || !loaded2) {
        return;
    }
    // {% endif %}

    restore_options();
    document.getElementById('saveSettings').addEventListener('click', save_options);
}

// {% if (env['target'] == 'chrome') or  (env['target'] == 'self_hosted') %}

var ajax1 = new Ajax();

ajax1.get({
    url: 'https://data.jsdelivr.com/v1/package/npm/dashjs',
    success: function(data) {
        loaded1 = true;
        data = JSON.parse(data);
        var target = document.querySelector('#dashjsSel');
        clearNode(target);
        populateSelection(data, target)
        attachEventListeners();
    }
});

var ajax2 = new Ajax();

ajax2.get({
    url: 'https://data.jsdelivr.com/v1/package/npm/hls.js',
    success: function(data) {
        loaded2 = true;
        var target = document.querySelector('#hlsjsSel');
        data = JSON.parse(data);
        clearNode(target);
        populateSelection(data, target);
        attachEventListeners();
    }
});

function populateSelection(data, target) {
    for(var i = 0; i < data.versions.length; i++) {
        var option = document.createElement('option');
        option.value = data.versions[i];
        option.innerText = data.versions[i];
        target.appendChild(option);
    }
}

// {% elif env['target'] == 'firefox' %}

attachEventListeners();

// {% endif %}

