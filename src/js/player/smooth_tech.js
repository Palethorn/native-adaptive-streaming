var SmoothTech = function(options) {
    throw "Not implemented.";
    
    this.options = options;
    this.player = new MediaPlayer();
    this.player.init(this.options.video_element);
    this.player.load(this.options.url);

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
            b.index = i
            b.bitrate = u[i];
            b.height = u[i] / 1000 + 'K';
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
        if(this.player != null) {
            this.player.reset(0);
            this.player = null;
        }
    }
}
