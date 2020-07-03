/**
 * Modifications copyright (C) 2017 David Ćavar
 */

// {% if env['target'] == 'chrome' %}

var hlsjs_version = 0;
var dashjs_version = 0;

var hlsjs_loaded = false;
var dashjs_loaded = false;

var maxQuality = false;

var video_native_mode = false;

function resize() {
    player_container.style.width = window.innerWidth + 'px';
    
    if(!video_native_mode) {
        video_element.style.width = window.innerWidth + 'px';
    }
}

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

// {% elif env['target'] == 'firefox' %}

// {% endif %}

state_machine.addTransitions('loader', [
    {from: 'visible', to: 'invisible', object: loader, handle: function(transition) {
        loader.style.visibility = 'collapse';
    }},
    {from: 'invisible', to: 'visible', object: loader, handle: function(transition) {
        loader.style.visibility = 'visible';
    }}
], 'visible');

state_machine.addTransitions('load_qualities', [
    {from: false, to: true, object: undefined, handle: function(transition) {
    }},
    {from: true, to: false, object: undefined, handle: function(transition) {
    }}
], false);

function reset() {
    if(player != null) {
        player.destroy();
    }

    player = null;
    state_machine.transition('la_url_form', 'invisible');
}

function restoreSettings() {

    chrome.storage.local.get({
        // {% if env['target'] == 'chrome' %}

        hlsjs_version: "0.8.9",
        dashjs_version: "2.6.5",
        // {% endif %}

        debug: false,
        video_native_mode: false,
        maxQuality: false
    }, function(settings) {
        debug = settings.debug;
        maxQuality = settings.maxQuality;
        video_native_mode = settings.video_native_mode;
        var url = window.location.href.split("#")[1];
        media_url_input.value = url;
        // {% if env['target'] == 'firefox' %}

        playUrl(url);
        // {% elif env['target'] == 'chrome' %}

        hlsjs_version = settings.hlsjs_version;
        dashjs_version = settings.dashjs_version;
        loadLibs(url);
        // {% endif %}

        if(video_native_mode) {
            video_element.classList.remove('responsive');
        }

        window.addEventListener('resize', resize);
        resize();
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

var formatTimeFromSeconds = function(val) {
    var hours = Math.floor(val / 3600);

    if((hours + '').length == 1) {
        hours = '0' + hours;
    }

    var minutes = Math.floor(val / 60);
    minutes = minutes < 60 ? minutes :  (Math.floor(val / 60) - hours * 60);
    
    if((minutes + '').length == 1) {
        minutes = '0' + minutes;
    }

    var seconds = val < 60 ? val : val - ((hours * 3600) + (minutes * 60));
    seconds = Math.floor(seconds);

    if((seconds + '').length == 1) {
        seconds = '0' + seconds;
    }

    return hours + ':' + minutes + ':' + seconds;
}

function playUrl(url) {
    reset();
    state_machine.setState('load_qualities', true);

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
        "headers": headers,
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
                        time.classList.remove('collapsed');
                        duration.classList.remove('collapsed');
                        duration.innerText = formatTimeFromSeconds(video_element.duration);
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
                        time.classList.remove('collapsed');
                        duration.classList.remove('collapsed');
                        duration.innerText = formatTimeFromSeconds(video_element.duration);
                    }

                    fillBitrates(player.getQualities());
                    break;
                case "manifestLoaded":
                    if(event.data.type == 'static') {
                        progress.classList.remove('collapsed');
                        time.classList.remove('collapsed');
                        duration.classList.remove('collapsed');
                        duration.innerText = formatTimeFromSeconds(video_element.duration);
                    }

                    fillBitrates(player.getQualities());
                    break;
                case 'timeupdate':
                    if(!seek_lock) {
                        var val = (video_element.currentTime / video_element.duration) * 100;
                        progress_range.setValue(val);
                    }
                    
                    var span = document.createElement('span');
                    span.innerText = formatTimeFromSeconds(video_element.currentTime);
                    clearNode(time);
                    time.appendChild(span);
                    break;
                case 'playing':
                    state_machine.transition('play_pause', 'playing');
                    player.setVolume(.5);
                    state_machine.transition('loader', 'invisible');

                    playback_speed_selection.addEventListener('change', function(e) {
                        player.setPlaybackRate(e.value);
                    });
                    
                    resize();

                    break;
                case 'pause':
                    state_machine.transition('play_pause', 'paused');
                    break;
                case 'volumechange':
                    volume_range.setValue(video_element.volume * 100);
                    break;
            }
        },
        "debug": false,
        "maxQuality": maxQuality
    });
}

var addHeader = function() {
    var header_name = header_name_input.value;
    var header_value = header_value_input.value;
    var list_item = header_list_view.querySelector('#' + header_name);

    if(list_item != undefined) {
        list_item.childNodes[1].innerText = header_value;
    } else {
        var list_item = document.createElement('li');
        list_item.id = header_name;
        var header_name_div = document.createElement('div');
        var header_value_div = document.createElement('div');
        var remove_div = document.createElement('div');
        var icon = document.createElement('i');
        icon.className = 'material-icons control';
        icon.innerText = 'delete_outline';
        header_name_div.className = 'col s5';
        header_value_div.className = 'col s5';
        remove_div.className = 'col s1';
        header_name_div.innerText = header_name;
        header_value_div.innerText = header_value;
        remove_div.appendChild(icon);
        remove_div.setAttribute('data-header', header_name);
        icon.setAttribute('data-header', header_name);
        remove_div.addEventListener('click', removeHeader, false);
        list_item.appendChild(header_name_div);
        list_item.appendChild(header_value_div);
        list_item.appendChild(remove_div);
        header_list_view.appendChild(list_item);
    }

    headers[header_name] = header_value;
}

var removeHeader = function(event) {
    var btn = event.target;
    var header = btn.getAttribute('data-header');
    var item = document.querySelector('#' + header);
    item.parentElement.removeChild(item);
    delete headers[header];
}

var close_input = document.getElementsByClassName('close-input');

for(var i = 0; i < close_input.length; i++) {
    close_input[i].addEventListener('click', function(e) {
        state_machine.transition(e.target.getAttribute('data-target'), 'invisible');
    }, false);
}

restoreSettings();
