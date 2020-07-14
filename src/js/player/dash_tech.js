var DashTech = function(options) {
    this.options = options;
    this.player = dashjs.MediaPlayer().create();
    
    if(typeof this.player.setFastSwitchEnabled != 'undefined') {
        this.player.setFastSwitchEnabled(true);
    }
    
    if(typeof this.player.getDebug().setLogToBrowserConsole !== 'undefined') {
        this.player.getDebug().setLogToBrowserConsole(options.debug);
    }

    this.is_live = false;

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
        if(e.data.type == 'dynamic') { console.log(e.data.type);
            self.is_live = true;
        }

        self.options.event_handler(e);
    });

    this.player.on(dashjs.MediaPlayer.events.ERROR, function(e) {
        self.options.event_handler(e);

        if(e.error.code == 111) {
            self.options.onLicenseError();
        }

        if(e.error == 'key_session') {
            self.options.onLicenseError();
            return;
        }

        self.destroy();
    });

    this.player.extend("RequestModifier", () => {
            return {
                modifyRequestHeader: xhr => {
                    for(var header_name in self.options.headers) {
                        xhr.setRequestHeader(header_name, self.options.headers[header_name]);
                    }

                    return xhr;
                },
                modifyRequestURL: url => {
                    return url;
                }
            };
        },
        true
    );

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
            if(typeof this.player.setAutoSwitchQuality !== 'undefined') {
                this.player.setAutoSwitchQuality(true);
            } else if(typeof this.player.setAutoSwitchQualityFor !== 'undefined') {
                this.player.setAutoSwitchQualityFor('video', true);
            } else if(typeof this.player.updateSettings !== 'undefined') {
                this.player.updateSettings({
                    'streaming': {
                        'abr': {
                            'autoSwitchBitrate': {
                                'video': true
                            }
                        }
                    }
                });
            }

            return;
        }

        if(typeof this.player.setAutoSwitchQuality !== 'undefined') {
            this.player.setAutoSwitchQuality(false);
        } else if(typeof this.player.setAutoSwitchQualityFor !== 'undefined') {
            this.player.setAutoSwitchQualityFor('video', false);
        } else if(typeof this.player.updateSettings !== 'undefined') {
            this.player.updateSettings({
                'streaming': {
                    'abr': {
                        'autoSwitchBitrate': {
                            'video': false
                        }
                    }
                }
            });
        }

        this.player.setQualityFor("video", index);
    }

    this.setMaxQuality = function() {
        var qualities = this.getQualities();
        var quality = qualities[0];
        
        for(var i = 1; i < qualities.length; i++) {
            if(qualities[i].bitrate > quality.bitrate) {
                quality = qualities[i];
            }
        }

        this.setQuality(quality.index);
    }

    this.destroy = function() {
        if(this.player != null) {
            this.player.reset();
            this.player = null;
        }
    }
}
