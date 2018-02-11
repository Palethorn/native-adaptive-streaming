/**
 * Modifications copyright (C) 2017 David Ćavar
 */

// {% if config['target'] == 'chrome' %}

var hlss_version = "0.8.9";
var dashjs_version = "2.6.5";
// {% endif %}

function save_options() {
  // {% if config['target'] == 'chrome' %}
  
  hlsjs_version = document.getElementById('hlsjsSel').value;
  dashjs_version = document.getElementById('dashjsSel').value;
  // {% endif %}

  var dbg = document.getElementById('cbDebug').checked;
  var ntv = document.getElementById('cbNative').checked;
  chrome.storage.local.set({
    // {% if config['target'] == 'chrome' %}
    hlsjs_version: hlsjs_version,
    dashjs_version: dashjs_version,
    // {% endif %}

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
    // {% if config['target'] == 'chrome' %}
    
    hlsjs_version: hls_current_version,
    dashjs_version: dashjs_current_version,
    // {% endif %}

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
    // {% if config['target'] == 'chrome' %}
    
    if(!loaded1 || !loaded2) {
        return;
    }
    // {% endif %}

    restore_options();
    document.getElementById('saveSettings').addEventListener('click', save_options);
}

// {% if config['target'] == 'chrome' %}

var ajax1 = new Ajax();

ajax1.get({
    url: 'https://data.jsdelivr.com/v1/package/npm/dashjs',
    success: function(data) {
        loaded1 = true;
        data = JSON.parse(data);
        dashjs_version = data.tags.latest;

        document.querySelector('#dashjsSel').innerHTML = '';
    
        for(var i = 0; i < data.versions.length; i++) {
            var option = document.createElement('option');
            option.value = data.versions[i];
            option.innerText = data.versions[i];
            document.querySelector('#dashjsSel').appendChild(option);
        }

        attachEventListeners();
    }
});

var ajax2 = new Ajax();

ajax2.get({
    url: 'https://data.jsdelivr.com/v1/package/npm/hls.js',
    success: function(data) {
        loaded2 = true;
        data = JSON.parse(data);
        hls_current_version = data.tags.latest;

        document.querySelector('#hlsjsSel').innerHTML = '';
        for(var i = 0; i < data.versions.length; i++) {
            var option = document.createElement('option');
            option.value = data.versions[i];
            option.innerText = data.versions[i];
            document.querySelector('#hlsjsSel').appendChild(option);
        }

        attachEventListeners();
    },
    error: function() {

    }
});

// {% elif config['target'] == 'firefox' %}

attachEventListeners();

// {% endif %}

