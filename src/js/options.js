/**
 * Modifications copyright (C) 2017 David Ćavar
 */

// {% if env['target'] == 'chrome' %}

var hlsjs_version = "0.13.2";
var dashjs_version = "3.0.3";
// {% endif %}

function save_options() {
  // {% if env['target'] == 'chrome' %}
  
  hlsjs_version = document.getElementById('hlsjsSel').value;
  dashjs_version = document.getElementById('dashjsSel').value;
  // {% endif %}

  var dbg = document.getElementById('cbDebug').checked;

  chrome.storage.local.set({
    // {% if env['target'] == 'chrome' %}
    
    hlsjs_version: hlsjs_version,
    dashjs_version: dashjs_version,
    // {% endif %}

    debug: dbg
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
    // {% if env['target'] == 'chrome' %}
    
    hlsjs_version: hlsjs_version,
    dashjs_version: dashjs_version,
    // {% endif %}

    debug: false,
  }, function(items) {
    document.getElementById('hlsjsSel').value = items.hlsjs_version;
    document.getElementById('dashjsSel').value = items.dashjs_version;
    document.getElementById('cbDebug').checked = items.debug;
  });
}

var loaded1 = false;
var loaded2 = false;

function attachEventListeners() {
    // {% if env['target'] == 'chrome' %}
    
    if(!loaded1 || !loaded2) {
        return;
    }
    // {% endif %}

    restore_options();
    document.getElementById('saveSettings').addEventListener('click', save_options);
}

// {% if env['target'] == 'chrome' %}

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

    target.value = hlsjs_version;
}

// {% elif env['target'] == 'firefox' %}

attachEventListeners();

// {% endif %}

