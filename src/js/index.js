/**
 * Modifications copyright (C) 2017 David Ćavar
 */

// {% if config['target'] == 'chrome' %}

var hlsjs_version = 0;
var dashjs_version = 0;

var hlsjs_loaded = false;
var dashjs_loaded = false;

function loadLibs(url) {
    var s1 = document.createElement('script');
    var s2 = document.createElement('script');

    s2.onload = function() {
        dashjs_loaded = true;
        if (dashjs_loaded && hlsjs_loaded) { 
            playUrl(url);
        }
    };

    s1.onload = function() {
        hlsjs_loaded = true;
        if (dashjs_loaded && hlsjs_loaded) {
            playUrl(url); 
        }

        
    }

    s1.src = 'https://cdn.jsdelivr.net/npm/hls.js@' + hlsjs_version + '/dist/hls.min.js';
    document.querySelector('head').appendChild(s1);
    s2.src = 'https://cdn.jsdelivr.net/npm/dashjs@' + dashjs_version + '/dist/dash.all.min.js';
    document.querySelector('head').appendChild(s2);
}

// {% elif config['target'] == 'firefox' %}

// {% endif %}

state_machine.addTransitions('loader', [
    {from: 'visible', to: 'invisible', object: loader, handle: function(transition) {
        loader.style.visibility = 'collapse';
    }},
    {from: 'invisible', to: 'visible', object: loader, handle: function(transition) {
        loader.style.visibility = 'visible';
    }}
], 'visible');

function reset() {
    if(player != null) {
        player.destroy();
    }

    player = null;
    state_machine.transition('la_url_form', 'invisible');
}

function restoreSettings() {

    chrome.storage.local.get({
        // {% if config['target'] == 'chrome' %}

        hlsjs_version: "0.8.9",
        dashjs_version: "2.6.5",
        // {% endif %}

        debug: false,
        native: false
    }, function(settings) {
        debug = settings.debug;
        native = settings.native;
        var url = window.location.href.split("#")[1];
        media_url_input.value = url;
        // {% if config['target'] == 'firefox' %}

        playUrl(url);
        // {% elif config['target'] == 'chrome' %}

        hlsjs_version = settings.hlsjs_version;
        dashjs_version = settings.dashjs_version;
        loadLibs(url);
        // {% endif %}
    
    });
}

function reloadPlayer(e) {
    state_machine.transition('la_url_form', 'invisible');
    playUrl(media_url_input.value);
}

function prepareLaUrlInput() {
    state_machine.transition('la_url_form', 'visible');
}

window.addEventListener("hashchange", function() {
    var url = window.location.href.split("#")[1];
    playUrl(url);
    
}, false);

function playUrl(url) {
    reset();

    player = new Player({
        "url": url,
        "autoplay": true,
        "video_element": video_element,
        "protData": {
            "com.widevine.alpha": {
                "serverURL": la_url.value
            }
        },
        "onLicenseError": function() {
            prepareLaUrlInput();
        },
        "event_handler": function(event) {

            var regex1 = /^(seeking)|(waiting)$/g;

            if(event.type.match(regex1) != null) {
                state_machine.transition('loader', 'visible');
                return;
            }

            switch(event.type) {
                case "loadeddata":
                    fillBitrates(player.getQualities());

                    if(!player.isLive()) {
                        progress.classList.remove('collapsed');
                    }

                    break;
                case "hlsNetworkError":
                    state_machine.transition('loader', 'visible');
                    break;
                case 'streamInitialized':
                    fillBitrates(player.getQualities());
                    break;
                case "hlsLevelLoaded":
                    if(event.details != undefined && event.details.live == false) {
                        progress.classList.remove('collapsed');
                    }

                    fillBitrates(player.getQualities());
                    break;
                case "manifestLoaded":
                    if(event.data.type == 'static') {
                        progress.classList.remove('collapsed');
                    }

                    fillBitrates(player.getQualities());
                    break;
                case 'timeupdate':
                    if(!seek_lock) {
                        var val = (video_element.currentTime / video_element.duration) * 100;
                        progress_range.setValue(val);
                    }
                    
                    break;
                case 'playing':
                    state_machine.transition('play_pause', 'playing');
                    player.setVolume(.5);
                    state_machine.transition('loader', 'invisible');
                    break;
                case 'pause':
                    state_machine.transition('play_pause', 'paused');
                    break;
                case 'volumechange':
                    volume_range.setValue(video_element.volume * 100);
                    break;
            }
        },
        "debug": false
    });
}

var close_input = document.getElementsByClassName('close-input');

for(var i = 0; i < close_input.length; i++) {
    close_input[i].addEventListener('click', function(e) {
        console.log(e.target.getAttribute('data-target'));
        state_machine.transition(e.target.getAttribute('data-target'), 'invisible');
    }, false);
}

restoreSettings();

window.addEventListener('resize', function() {
    console.log(window.innerWidth);
    player_container.style.width = window.innerWidth + 'px';
    video_element.style.width = window.innerWidth + 'px';
});

player_container.style.width = window.innerWidth -  + 'px';
video_element.style.width = window.innerWidth + 'px';