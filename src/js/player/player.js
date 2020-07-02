/**
 * Modifications copyright (C) 2017 David Ćavar
 */

var player = null;
var debug = false;
var hlsjsCurrentVersion = "0";
var dashjsCurrentVersion = "0";

var loaded1 = loaded2 = false;

/**
 * Abstraction
 */
var Player = function(options) {
    this.tech = null;
    this.options = options;
    var self = this;

    this.available_events = ["abort", "canplay", "canplaythrough", "durationchange", "emptied", "encrypted", "ended", "error", "interruptbegin", "loadeddata", 
                             "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "seeked", "seeking", "stalled", "suspend", 
                             "timeupdate", "volumechange", "waiting"];

    if(options.debug == undefined) {
        options.debug = false;
    }

    this.getOptions = function() {
        return this.options;
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
            } else if(this.options.tech = 'smooth') {
                this.tech = new SmoothTech(this.options);
            } else if(this.options.tech = 'hls') {
                this.tech = new HlsTech(this.options);
            } else if(this.options.tech = 'smooth') {
                this.tech = new SmoothTech(this.options);
            }
        } else {
            var url = this.getUrl();

            if(url.indexOf('.mpd') > -1) {
                console.log("Selecting DASH tech...");
                this.tech = new DashTech(this.options);
            } else if(url.indexOf('.m3u8') > -1) {
                console.log("Selecting HLS tech...");
                this.tech = new HlsTech(this.options);
            } else if(url.indexOf('Manifest') > -1) {
                console.log("Selecting Smooth tech...");
                this.tech = new SmoothTech(this.options);
            }
        }

        if(this.tech == undefined) {
            throw 'Url ' + url + ' not recognized.';
        }
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

    this.setMaxQuality = function() {
        this.tech.setMaxQuality();
    }

    this.setPlaybackRate = function(value) {
        this.options.video_element.playbackRate = value;
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
        clearNode(this.options.video_element);
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
