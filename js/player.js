/**
 * Modifications copyright (C) 2017 David Ćavar
 */

var player = null;
var debug = false;
var hlsjsCurrentVersion = "0";
var dashjsCurrentVersion = "0";

var loaded1 = loaded2 = false;

var SmoothTech = function() {
    throw "Not implemented.";
}

var DashTech = function(options) {
    this.options = options;
    this.player = dashjs.MediaPlayer().create();
    this.player.getDebug().setLogToBrowserConsole(options.debug);
    
    if(options.protData != undefined) {
        this.player.setProtectionData(options.protData);
    }

    this.player.on(dashjs.MediaPlayer.events.ERROR, function (e) {
        console.error(e.error + ' : ' + e.event.message);

        if(e.error == 'key_session') {
            this.options.onLicenseError();
            return;
        }

        this.options.onError();
        this.destroy();
    });

    this.player.initialize();
    this.player.label = "dash";
    this.player.attachView(options.video_element);
    this.player.setAutoPlay(options.autoplay);
    this.player.attachSource(this.options.url);

    this.getOptions = function() {
        return this.options;
    }

    this.getPlayer = function() {
        return this.player;
    }

    this.destroy = function() {
        this.player.reset();
        this.player = null;
    }
}

var HlsTech = function(options) {
    this.options = options;
    this.recover_take = 0;
    this.player = new Hls({
        debug: options.debug
    });


    if(this.options.autoplay === true) {
        var self = this;
        this.player.on(Hls.Events.MANIFEST_PARSED, function() {
            self.options.video_element.play();
        });
    }

    this.player.on(Hls.Events.ERROR, function(event, data) {
        var  msg = "Player error: " + data.type + " - " + data.details;

        if(data.fatal) {
            switch(data.type) {
                case Hls.ErrorTypes.MEDIA_ERROR: 
                    console.error("Media error");
                    
                    if(this.recover_take == 1) {
                        hls.swapAudioCodec();
                    }

                    hls.recoverMediaError();
                    this.recover_take++;
                    break;
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error("Network error");
                    hls.startLoad();
                    break;
                default:
                    console.error("Unrecoverable error");
                    this.options.onError();
                    this.destroy();
                    break;
              }
        }
    });


    this.player.loadSource(this.options.url);
    this.player.attachMedia(options.video_element);

    this.getOptions = function() {
        return this.options;
    }

    this.getPlayer = function() {
        return this.player;
    }

    this.destroy = function() {
        this.player.destroy();
        this.player = null;
    }
}

var Player = function(options) {
    this.tech = null;
    this.options = options;

    if(options.debug == undefined) {
        options.debug = false;
    }

    this.getUrl = function() {
        return this.options.url;
    }

    this.guess = function() {
        if(this.options.tech != undefined) {
            if(this.options.tech = 'dash') {
                this.tech = new DashTech(this.options);
                return;
            }

            if(this.options.tech = 'smooth') {
                this.tech = new SmoothTech(this.options);
                return;
            }

            if(this.options.tech = 'hls') {
                this.tech = new HlsTech(this.options);
                return;
            }
        }

        var url = this.getUrl();

        if(url.indexOf('.mpd') > -1) {
            console.log("Selecting DASH tech...");
            this.tech = new DashTech(this.options);
            return;
        } 
        
        if(url.indexOf('.m3u8')) {
            console.log("Selecting HLS tech...");
            this.tech = new HlsTech(this.options);
            return;
        } 
        
        if(url.indexOf('Manifest')) {
            console.log("Selecting Smooth tech...");
            this.tech = new SmoothTech(this.options);
            return;
        }

        throw 'Url ' + url + ' not recognized.';
    }

    this.play = function() {
        this.options.video_element.play();
    }

    this.pause = function() {
        this.options.video_element.pause();
    }

    this.destroy = function() {
        this.tech.destroy();
        this.tech = null;
    }

    this.guess();
}

function reloadPlayer(e) {
    state_machine.transition('la_url_form', 'invisible');
    playUrl(media_url_input.value);
}

function prepareLaUrlInput() {
    state_machine.transition('la_url_form', 'visible');
}

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
        "debug": false
    });
}