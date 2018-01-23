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

volume.addEventListener('mouseover', function() {
    volume_popup.classList.remove('collapsed', 'fadeOut');
    volume_popup.classList.add('animated', 'fadeIn');
});

volume.addEventListener('mouseout', function() {
    volume_popup.classList.remove('fadeIn');
    volume_popup.classList.add('animated', 'fadeOut');
});

settings.addEventListener('mouseover', function() {
    settings_popup.classList.remove('collapsed', 'fadeOut');
    settings_popup.classList.add('animated', 'fadeIn');
});

settings.addEventListener('mouseout', function() {
    settings_popup.classList.remove('fadeIn');
    settings_popup.classList.add('animated', 'fadeOut');
});


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
    state_machine.transition('la_url_form', 'invisible');
    playUrl(media_url_input.value);
}

function prepareLaUrlInput() {
    state_machine.transition('la_url_form', 'visible');
}

function reset() {

    if(hls) { hls.destroy(); }
    if(dash) { dash.reset(); dash = null; }
    state_machine.transition('la_url_form', 'invisible');
}

function playMpd(url) {
    if(dash) { dash.reset(); dash = null; }

    dash = dashjs.MediaPlayer().create();
    dash.getDebug().setLogToBrowserConsole(false);
    
    dash.on(dashjs.MediaPlayer.events.ERROR, function (e) {
        console.error(e.error + ' : ' + e.event.message);
        if(e.error == 'key_session') {
            prepareLaUrlInput();
        }
    });

    var initialized = function() {

    }

    if(la_url.value != '' && la_url.value != null) {
        var protData = { "com.widevine.alpha": { "serverURL": la_url.value}};
        dash.setProtectionData(protData);
    }

    dash.initialize();

    dash.label = "mpd";
    dash.attachView(player);
    dash.setAutoPlay(true);
    dash.attachSource(url);
}

function playM3u8(url) {
    var video = player;

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
        media_url_input.value = url;

        var s1 = document.createElement('script');
        var s2 = document.createElement('script');
        
        if(url.indexOf(".mpd") > -1) {
            s2.onload = function() { playUrl(url); };
        } else {
            s1.onload = function() { playUrl(url); };
        }
        
        s1.src = 'https://cdn.jsdelivr.net/npm/hls.js@' + settings.hlsjs + '/dist/hls.min.js';
        (document.head || document.documentElement).appendChild(s1);

        s2.src = 'https://cdn.jsdelivr.net/npm/dashjs@' + settings.dashjs + '/dist/dash.all.min.js';
        (document.head || document.documentElement).appendChild(s2);

        $('head').append(s1);
        $('head').append(s2);
    });
}

window.addEventListener("hashchange", function() {
    var url = window.location.href.split("#")[1];
    playUrl(url);
}, false);

function playUrl(url) {
    reset();
    media_url_input.value = url;

    if(url.indexOf(".mpd") > -1) {
        playMpd(url);
    } else {
        playM3u8(url);;
    }
}