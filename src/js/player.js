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
    this.player.setFastSwitchEnabled();
    this.player.getDebug().setLogToBrowserConsole(options.debug);
    this.is_live = undefined;

    if(options.protData != undefined) {
        this.player.setProtectionData(options.protData);
    }

    var self = this;

    this.player.on(dashjs.MediaPlayer.events.METRIC_CHANGED, function(e) {
        self.options.event_handler(e);
    });

    this.player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, function(e) {
        self.options.event_handler(e);
    });

    this.player.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, function(e) {
        if(e.data.type == 'dynamic') {
            self.is_live = true;
        }

        self.options.event_handler(e);
    });

    this.player.on(dashjs.MediaPlayer.events.ERROR, function(e) {
        self.options.event_handler(e);

        if(e.error == 'key_session') {
            self.options.onLicenseError();
            return;
        }

        self.options.onError();
        self.destroy();
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

    this.isLive = function() {
        return this.is_live;
    }

    this.getQualities = function() {
        var u = this.player.getBitrateInfoListFor("video");
        var bitrates = [];

        for(var i = 0; i < u.length; i++) {
            var b = {};
            b.index = u[i].qualityIndex;
            b.bitrate = u[i].bitrate;
            b.height = u[i].height;
            bitrates.push(b);
        }

        return bitrates;
    }

    this.setQuality = function(index) {
        index = parseInt(index);

        if(index == -1) {
            this.player.setAutoSwitchQuality(true);
            return;
        }

        this.player.setAutoSwitchQuality(false);
        this.player.setQualityFor("video", index);
    }

    this.destroy = function() {
        this.player.reset();
        this.player = null;
    }
}

var HlsTech = function(options) {
    this.options = options;
    this.recover_take = 0;
    var self = this;

    this.player = new Hls({
        // {% if config['target'] == 'chrome' %}
        
        enableWorker: true,
        // {% elif config['target'] == 'firefox' %}

        enableWorker: false,
        // {% endif %}
        
        debug: options.debug
    });

    this.player.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
        data.type = event;
        self.options.event_handler(data);

        if(self.options.autoplay === true) {
            self.options.video_element.play();
        }
    });

    this.player.on(Hls.Events.LEVEL_LOADED, function(event, data) {
        if(data.details != undefined && data.details.type == 'VOD') {
            self.is_live = true;
        }

        data.type = event;
        self.options.event_handler(data);
    });

    this.player.on(Hls.Events.ERROR, function(event, data) {
        var  msg = "Player error: " + data.type + " - " + data.details;
        data.type = event;
        console.error(event, data);

        if(data.fatal) {
            switch(data.type) {
                case Hls.ErrorTypes.MEDIA_ERROR: 
                    console.error("Media error");
                    self.options.event_handler(data);

                    if(self.recover_take == 1) {
                        hls.swapAudioCodec();
                    }

                    hls.recoverMediaError();
                    self.recover_take++;
                    break;
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error("Network error");
                    self.options.event_handler(data);
                    hls.startLoad();
                    break;
                default:
                    console.error("Unrecoverable error");
                    self.options.event_handler(data);
                    self.destroy();
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

    this.isLive = function() {
        return this.is_live;
    }

    this.getQualities = function() {
        var u = this.player.levels;
        var bitrates = [];

        for(var i = 0; i < u.length; i++) {
            var b = {};
            b.index = u[i].level;
            b.bitrate = u[i].bitrate;
            b.height = u[i].height;
            bitrates.push(b);
        }

        return bitrates;
    }

    this.setQuality = function(index) {
        index = parseInt(index);
        this.player.currentLevel = index;
        this.player.nextLevel = index;
        this.player.loadLevel = index;
    }

    this.destroy = function() {
        this.player.destroy();
        this.player = null;
    }
}

var Player = function(options) {
    this.tech = null;
    this.options = options;
    this.is_live = false;
    var self = this;

    this.available_events = ["abort", "canplay", "canplaythrough", "durationchange", "emptied", "encrypted", "ended", "error", "interruptbegin", "loadeddata", 
                             "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "seeked", "seeking", "stalled", "suspend", 
                             "timeupdate", "volumechange", "waiting"];

    if(options.debug == undefined) {
        options.debug = false;
    }

    this.getUrl = function() {
        return this.options.url;
    }

    this.getTech = function() {
        return this.tech;
    }

    this.addEventHandler = function() {
        for(var i = 0; i < this.available_events.length; i++) {
            this.options.video_element.addEventListener(this.available_events[i], this.options.event_handler, false);
        }
    }

    this.removeEventHandler = function() {
        for(var i = 0; i < this.available_events.length; i++) {
            this.options.video_element.removeEventListener(this.available_events[i], this.options.event_handler);
        }
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

    this.seek = function(seconds) {
        var v = this.options.video_element;
        v.currentTime = seconds;
    }

    this.getDuration = function() {
        return this.options.video_element.duration;
    }

    this.isLive = function() {
        return this.getTech().isLive();
    }

    this.getQualities = function() {
        return this.getTech().getQualities();
    }

    this.setQuality = function(index) {
        this.getTech().setQuality(index);
    }

    this.setVolume = function(volume) {
        this.options.video_element.volume = volume;
    }

    this.loadSubtitles = function(url) {
        this.clearVideoElement();
        var track = document.createElement('track');
        track.label = 'Subtitle';
        track.kind = 'subtitles';
        track.default = 'default';
        track.src = url;
        this.options.video_element.appendChild(track);
    }

    this.clearVideoElement = function() {
        this.options.video_element.innerHTML = '';
    }

    this.destroy = function() {
        this.clearVideoElement();
        this.removeEventHandler();
        this.tech.destroy();
        this.tech = null;
    }

    this.addEventHandler()
    this.guess();
}

