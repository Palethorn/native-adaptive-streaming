/**
 * Modifications copyright (C) 2017 David Ćavar
 */

function reset() {
    if(player != null) {
        player.destroy();
    }

    player = null;
    state_machine.transition('la_url_form', 'invisible');
}

$.ajax('https://data.jsdelivr.com/v1/package/npm/dashjs', {
    dataType: 'json',
    success: function(data) {
        loaded1 = true;
        dashjsCurrentVersion = data.tags.latest;
        restoreSettings();
    },
    error: function() {

    }
});

$.ajax('https://data.jsdelivr.com/v1/package/npm/hls.js', {
    dataType: 'json',
    success: function(data) {
        loaded2 = true;
        hlsjsCurrentVersion = data.tags.latest;
        restoreSettings();
    },
    error: function() {

    }
});

function restoreSettings() {
    if(!loaded1 || !loaded2) {
        return;
    }

    chrome.storage.local.get({
        hlsjs: hlsjsCurrentVersion,
        dashjs: dashjsCurrentVersion,
        debug: false,
        native: false
    }, function(settings) {
        debug = settings.debug;
        native = settings.native;
        
        var url = window.location.href.split("#")[1];
        media_url_input.value = url;

        var s1 = document.createElement('script');
        var s2 = document.createElement('script');
        
        if(url.indexOf(".mpd") > -1) {
            s2.onload = function() { playUrl(url); };
        } else {
            s1.onload = function() { playUrl(url); };
        }
        
        s1.src = 'https://cdn.jsdelivr.net/npm/hls.js@' + settings.hlsjs + '/dist/hls.min.js';
        document.querySelector('head').appendChild(s1);
        s2.src = 'https://cdn.jsdelivr.net/npm/dashjs@' + settings.dashjs + '/dist/dash.all.min.js';
        document.querySelector('head').appendChild(s2);
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
    console.log(url);

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
            switch(event.type) {
                case "hlsLevelLoaded":
                    if(event.details != undefined && event.details.type == 'VOD') {
                        progress.classList.remove('collapsed');
                    }

                    break;
                case "manifestLoaded":
                    if(event.data.type == 'static') {
                        progress.classList.remove('collapsed');
                    }

                    break;
                case 'timeupdate':
                    if(!seek_lock) {
                        progress_line.style.width = ((video_element.currentTime / video_element.duration) * 100) + '%';
                    }
                    
                    break;
                case 'play':
                    state_machine.transition('play_pause', 'playing');
                    break;
                case 'pause':
                    state_machine.transition('play_pause', 'paused');
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