var SmoothTech = function(options) {
    var self = this;
    this.options = options;

    var stream = {
        url: options.url
    };

    this.player = new MediaPlayer();
    this.player.init(options.video_element);
    this.player.load(stream);
    this.player.addEventListener("error", this.options.event_handler);
    this.player.addEventListener("warning", this.options.event_handler);
    this.player.addEventListener("cueEnter", this.options.event_handler);
    this.player.addEventListener("cueExit", this.options.event_handler);
    this.player.addEventListener("play_bitrate", this.options.event_handler);
    this.player.addEventListener("download_bitrate", this.options.event_handler);
    this.player.addEventListener("manifestUrlUpdate", this.options.event_handler);
    this.player.addEventListener("metricAdded", this.options.event_handler);
    this.player.addEventListener("metricChanged", this.options.event_handler);
    this.player.addEventListener("bufferLevel_updated", this.options.event_handler);
    this.player.addEventListener("state_changed", this.options.event_handler);
    this.player.addEventListener("loadeddata", this.options.event_handler);
    this.player.addEventListener("play", this.options.event_handler);
    this.player.addEventListener("pause", this.options.event_handler);
    this.player.addEventListener("timeupdate", this.options.event_handler);
    this.player.addEventListener("volumechange", this.options.event_handler);

    this.getOptions = function() {
        return this.options;
    }

    this.getPlayer = function() {
        return this.player;
    }

    this.isLive = function() {
        return this.player.isLive();
    }

    this.getQualities = function() {
        var u = this.player.getVideoBitrates();

        var bitrates = [];

        for(var i = 0; i < u.length; i++) {
            var b = {};
            b.index = i;
            b.bitrate = u[i];
            bitrates.push(b);
        }

        return bitrates;
    }

    this.setQuality = function(index) {
        if(index == -1) {
            this.player.setAutoSwitchQuality(true);
            return;
        }

        this.player.setAutoSwitchQuality(false);
        this.player.setQualityFor('video', index);
    }

    this.destroy = function() {
        if(this.player != null) {
            this.player = null;
        }
    }
}
