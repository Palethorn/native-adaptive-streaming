/**
 * Modifications copyright (C) 2017 David Ćavar
 */

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
        debug: false,
        native: false
    }, function(settings) {
        debug = settings.debug;
        native = settings.native;
        var url = window.location.href.split("#")[1];
        media_url_input.value = url;
        playUrl(url);
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
            if(event.type != 'timeupdate') {
                console.log(event.type);
            }

            var regex1 = /^(seeking)|(waiting)$/g;

            if(event.type.match(regex1) != null) {
                state_machine.transition('loader', 'visible');
                return;
            }

            switch(event.type) {
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