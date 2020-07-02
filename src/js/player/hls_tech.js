var HlsTech = function(options) {
    this.options = options;
    this.recover_take = 0;
    var self = this;
    this.is_live = false;

    this.player = new Hls({
        // {% if env['target'] == 'chrome' %}
        
        enableWorker: true,
        // {% elif env['target'] == 'firefox' %}

        enableWorker: false,
        // {% endif %}
        
        debug: options.debug,

        xhrSetup: function(xhr, url) {
            for(var header_name in self.options.headers) {
                xhr.setRequestHeader(header_name, self.options.headers[header_name]);
            }
        }
    });

    this.player.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
        data.type = event;
        self.options.event_handler(data);

        if(self.options.autoplay === true) {
            self.options.video_element.play();
        }
    });

    this.player.on(Hls.Events.LEVEL_LOADED, function(event, data) {
        if(data.details != undefined && data.details.type !== 'VOD') { console.log(data.details);
            self.is_live = true;
        }

        data.type = event;
        self.options.event_handler(data);
    });

    this.player.on(Hls.Events.ERROR, function(event, data) {
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
            b.index = u[i].level != undefined ? u[i].level : i;
            b.bitrate = u[i].bitrate;
            b.height = u[i].height;
            b.bane = u[i].name;
            bitrates.push(b);
        }

        return bitrates;
    }

    this.setQuality = function(index) {
        index = parseInt(index);
        this.player.currentLevel = index;
    }

    this.setMaxQuality = function() {
        var qualities = this.getQualities();
        maxQualityIndex = -1;
        bitrate = 0;

        for(var i = 0; i < qualities.length; i++) {
            if(qualities[i].bitrate > bitrate) {
                bitrate = qualities[i].bitrate;
                maxQualityIndex = i;
            }
        }

        this.setQuality(maxQualityIndex);
    }

    this.destroy = function() {
        if(this.player != null) {
            this.player.destroy();
            this.player = null;
        }
    }
}