var body = document.querySelector('body');
var controls = document.querySelector('#controls');
var video_element = document.querySelector('#player');
var player_container = document.querySelector('#player-container');
var play_pause = document.querySelector('#play-pause');
var volume = document.querySelector('#volume');
var settings = document.querySelector('#settings');
var la_url_toggle_btn = document.querySelector('#la-url-toggle-btn');
var headers_toggle_btn = document.querySelector('#headers-toggle-btn');
var add_header_btn = document.querySelector('#add-header-btn');
var la_url = document.querySelector('#la-url');
var reload_source_media_url_btn = document.querySelector('#reload-source-media-url-btn');
var reload_source_la_url_btn = document.querySelector('#reload-source-la-url-btn');
var volume_popup = document.querySelector("#volume-popup");
var settings_form = document.querySelector("#settings-form");
var settings_btn = document.querySelector("#settings-btn");
var volume_btn = document.querySelector("#volume-btn");
var la_url_form = document.querySelector("#la-url-form");
var headers_form = document.querySelector("#headers-form");
var media_url_form = document.querySelector("#media-url-form");
var subtitles_url_form = document.querySelector("#subtitles-url-form");
var media_url_toggle_btn = document.querySelector("#media-url-toggle-btn");
var subtitles_toggle_btn = document.querySelector("#subtitles-toggle-btn");
var media_url_input = document.querySelector("#media-url-input");
var subtitles_url_input = document.querySelector("#subtitles-url-input");
var fullscreen_toggle_btn = document.querySelector("#fullscren-toggle-btn");
var load_subtitles_url_btn = document.querySelector("#load-subtitles-url-btn");
var headers_reload_player_btn = document.querySelector("#headers-reload-player-btn");
var loader = document.querySelector('#loader');
var time = document.querySelector('#time');
var duration = document.querySelector('#duration');
var header_name_input = document.querySelector('#header-name');
var header_value_input = document.querySelector('#header-value');
var header_list_view = document.querySelector('#header-list-view');
var headers_reload_player_btn = document.querySelector("#headers-reload-player-btn");

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
        player.setVolume(value / 100);
    }
});

var bitrate_selection = new Dropdown({
    target: document.querySelector('#bitrate-selection'),
    label: "Bitrate"
});

var playback_speed_selection = new Dropdown({
    target: document.querySelector('#playback-speed-selection'),
    label: "Playback speed",
    options: [
        {
            label: "x0.25",
            value: 0.25,
            selected: false
        },
        {
            label: "x0.5",
            value: 0.5,
            selected: false
        },
        {
            label: "x1",
            value: 1,
            selected: true
        },
        {
            label: "x1.25",
            value: 1.25,
            selected: false
        },
        {
            label: "x1.5",
            value: 1.5,
            selected: false
        },
        {
            label: "x2",
            value: 2,
            selected: false
        },
    ]
});

playback_speed_selection.addEventListener('change', function(e) {
    if(player != null) {
        player.setPlaybackRate(e.value);
    }
});