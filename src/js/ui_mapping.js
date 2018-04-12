var body = document.querySelector('body');
var controls = document.querySelector('#controls');
var video_element = document.querySelector('#player');
var player_container = document.querySelector('#player-container');
var play_pause = document.querySelector('#play-pause');
var volume = document.querySelector('#volume');
var settings = document.querySelector('#settings');
var la_url_toggle_btn = document.querySelector('#la-url-toggle-btn');
var la_url = document.querySelector('#la-url');
var reload_source_media_url_btn = document.querySelector('#reload-source-media-url-btn');
var reload_source_la_url_btn = document.querySelector('#reload-source-la-url-btn');
var volume_popup = document.querySelector("#volume-popup");
var settings_form = document.querySelector("#settings-form");
var settings_btn = document.querySelector("#settings-btn");
var la_url_form = document.querySelector("#la-url-form");
var media_url_form = document.querySelector("#media-url-form");
var subtitles_url_form = document.querySelector("#subtitles-url-form");
var media_url_toggle_btn = document.querySelector("#media-url-toggle-btn");
var subtitles_toggle_btn = document.querySelector("#subtitles-toggle-btn");
var media_url_input = document.querySelector("#media-url-input");
var subtitles_url_input = document.querySelector("#subtitles-url-input");
var playback_speed = document.querySelector("#playback-speed");
var bitrate_selection = document.querySelector("#bitrate-selection");
var fullscreen_toggle_btn = document.querySelector("#fullscren-toggle-btn");
var load_subtitles_url_btn = document.querySelector("#load-subtitles-url-btn");
var loader = document.querySelector('#loader');
var time = document.querySelector('#time');
var duration = document.querySelector('#duration');

var progress_range = new Range({
    target: document.querySelector('#progress'),
    target_classlist: 'collapsed',
    type: 'horizontal',
    min_value: 0,
    max_value: 100,
    value: 0,
    valueChanged: function(value) {
        video_element.currentTime = video_element.duration * (value / 100);
    }
});

var volume_range = new Range({
    target: document.querySelector('#volume-control-container'),
    target_classlist: '',
    type: 'vertical',
    min_value: 0,
    max_value: 100,
    value: 0,
    valueChanged: function(value) {
        video_element.volume = value / 100;
    }
});