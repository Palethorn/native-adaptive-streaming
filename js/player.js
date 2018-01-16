/**
 * Modifications copyright (C) 2017 David Ćavar
 */
var hls;
var debug;
var hlsjsCurrentVersion = "0";
var dashjsCurrentVersion = "0";
var recoverDecodingErrorDate,recoverSwapAudioCodecDate;
var dash;
var loaded1 = loaded2 = false;
var play_pause = document.querySelector('#play-pause');
var volume = document.querySelector('#volume');
var settings = document.querySelector('#settings');
var STATE_PAUSED = 0;
var STATE_PLAYING = 1;
var PLAYER_STATE = 0;
var ANIMATION_FADE_OUT_END_STATE = 0;
var ANIMATION_FADE_IN_END_STATE = 1;
var CONTROLS_ANIMATION_ENDSTATE = ANIMATION_FADE_OUT_END_STATE;

function controlsAnimationEnd() {
    if(CONTROLS_ANIMATION_ENDSTATE == ANIMATION_FADE_OUT_END_STATE) {
        CONTROLS_ANIMATION_ENDSTATE = ANIMATION_FADE_IN_END_STATE;
    } else {
        CONTROLS_ANIMATION_ENDSTATE = ANIMATION_FADE_OUT_END_STATE;
    }

    document.querySelector('#controls').classList.remove('fadeIn');
    document.querySelector('#controls').classList.add('animation-delay', 'fadeOut');
}

function playerMouseMove() {
    if(CONTROLS_ANIMATION_ENDSTATE == ANIMATION_FADE_OUT_END_STATE) {
        return;
    }

    document.querySelector('#controls').classList.remove('animation-delay', 'fadeOut');
    document.querySelector('#controls').classList.add('fadeIn');
}

document.querySelector('#controls').addEventListener('animationend', controlsAnimationEnd);
document.querySelector('#player').addEventListener('mousemove', playerMouseMove);

play_pause.addEventListener('click', playPause);

volume.addEventListener('mouseover', function() {
    document.querySelector("#volume-popup").classList.remove('collapsed', 'fadeOut');
    document.querySelector("#volume-popup").classList.add('animated', 'fadeIn');
});

volume.addEventListener('mouseout', function() {
    document.querySelector("#volume-popup").classList.remove('fadeIn');
    document.querySelector("#volume-popup").classList.add('animated', 'fadeOut');
});

settings.addEventListener('mouseover', function() {
    document.querySelector("#settings-popup").classList.remove('collapsed', 'fadeOut');
    document.querySelector("#settings-popup").classList.add('animated', 'fadeIn');
});

settings.addEventListener('mouseout', function() {
    document.querySelector("#settings-popup").classList.remove('fadeIn');
    document.querySelector("#settings-popup").classList.add('animated', 'fadeOut');
});

document.querySelector("#player").addEventListener('pause', function () {
    PLAYER_STATE = STATE_PAUSED;
    play_pause.innerText = "play_arrow";
});

document.querySelector("#player").addEventListener('play', function () {
    PLAYER_STATE = STATE_PLAYING;
    play_pause.innerText = "pause";
});

function playPause() {
    var video_el = document.querySelector('video');

    if(PLAYER_STATE == STATE_PAUSED) {
        video_el.play();
    } else {
        video_el.pause();
    }
}

function handleMediaError(hls) {
    var now = performance.now();

    if(!recoverDecodingErrorDate || (now - recoverDecodingErrorDate) > 3000) {
        recoverDecodingErrorDate = performance.now();
        var msg = "trying to recover from media Error ..."
        console.warn(msg);
        hls.recoverMediaError();
    } else {
        if(!recoverSwapAudioCodecDate || (now - recoverSwapAudioCodecDate) > 3000) {
            recoverSwapAudioCodecDate = performance.now();
            var msg = "trying to swap Audio Codec and recover from media Error ..."
            console.warn(msg);
            hls.swapAudioCodec();
            hls.recoverMediaError();
        } else {
            var msg = "cannot recover, last media error recovery failed ..."
            console.error(msg);
        }
    }
}

function reloadPlayer(e) {
    document.querySelector("#la-url-input").classList.add('fadeOutUp');
    document.querySelector("#reload-source").removeEventListener('click', reloadPlayer);
    la_url = document.querySelector("#la-url").value;

    if(la_url != null && la_url != '') {
        playMpd(window.location.href.split("#")[1], la_url);
    } else {
        playMpd(window.location.href.split("#")[1], null);
    }
}

function prepareLaUrlInput() {
    document.querySelector("#la-url-input").classList.remove('collapsed');
    document.querySelector("#la-url-input").classList.add('animated', 'fadeInDown');
    document.querySelector("#reload-source").addEventListener('click', reloadPlayer);
}

function reset() {

    if(hls) { hls.destroy(); }
    if(dash) { dash.reset(); dash = null; }
    document.querySelector("#la-url-input").classList.add('fadeOutUp');
    document.querySelector("#reload-source").removeEventListener('click', reloadPlayer);
}

function playMpd(url, la_url) {
    if(dash) { dash.reset(); dash = null; }

    var video_el = document.querySelector('#player');
    video_element = video_el;
    dash = dashjs.MediaPlayer().create();
    dash.getDebug().setLogToBrowserConsole(false);
    
    dash.on(dashjs.MediaPlayer.events.ERROR, function (e) {
        console.error(e.error + ' : ' + e.event.message);
        if(e.error == 'key_session') {
            prepareLaUrlInput();
        }
    });

    dash.on(dashjs.MediaPlayer.events.PLAYBACK_ENDED, function (e) {

    });

    if(la_url != null) {
        var protData = { "com.widevine.alpha": { "serverURL": la_url}};
        dash.setProtectionData(protData);
    }

    dash.initialize();

    dash.label = "mpd";
    dash.attachView(video_el);
    dash.setAutoPlay(true);
    dash.attachSource(url);
}

function playM3u8(url) {
    var video = document.querySelector('#player');

    if(hls) { hls.destroy(); }
    hls = new Hls({debug:debug});

    hls.on(Hls.Events.ERROR, function(event,data) {
        var  msg = "Player error: " + data.type + " - " + data.details;

        if(data.fatal) {
            switch(data.type) {
                case Hls.ErrorTypes.MEDIA_ERROR:
                    handleMediaError(hls);
                    break;
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error("network error ...");
                    break;
                default:
                    console.error("unrecoverable error");
                    hls.destroy();
                    break;
              }
        }
    });

    var m3u8Url = decodeURIComponent(url)
    hls.loadSource(m3u8Url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED,function() {
        video.play();
    });

    hls.on(Hls.Events.LEVEL_LOADED,function(event,data) {
        var level_duration = data.details.totalduration;
      });

    document.title = url;
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

        var s1 = document.createElement('script');
        var s2 = document.createElement('script');

        s1.src = 'https://cdn.jsdelivr.net/npm/hls.js@' + settings.hlsjs + '/dist/hls.min.js';
        (document.head || document.documentElement).appendChild(s1);

        s2.src = 'https://cdn.jsdelivr.net/npm/dashjs@' + settings.dashjs + '/dist/dash.all.min.js';
        (document.head || document.documentElement).appendChild(s2);

        if(url.indexOf(".mpd") > -1) {
            s2.onload = function() { playMpd(url, null); };
        } else {
            s1.onload = function() { playM3u8(url); };
        }

        $('head').append(s1);
        $('head').append(s2);
    });
}

$(window).bind('hashchange', function() {
    var url = window.location.href.split("#")[1];
    reset();

    if(url.indexOf(".mpd") > -1) {
        playMpd(url, null);
    } else {
        playM3u8(url);
    }
});
