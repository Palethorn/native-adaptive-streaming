state_machine.addTransitions('controls', [
    {from: "visible", to: "invisible", object: controls, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('fadeIn');
        o.classList.add('fadeOut');
    }},
    {from: "invisible", to: "visible", object: controls, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('fadeOut');
        o.classList.add('fadeIn');
    }},
    {from: "visible", to: "frozen", object: controls, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('fadeOut', 'fadeIn');
    }},
    {from: "frozen", to: "visible", object: controls, handle: function(transition) {
    }}
], 'visible');

state_machine.addTransitions('play_pause', [
    {from: "playing", to: "paused", object: play_pause, handle: function(transition) {
        transition.object.innerText = "play_arrow";
    }},
    {from: "paused", to: "playing", object: play_pause, handle: function(transition) {
        transition.object.innerText = "pause";
    }}
], 'paused');

state_machine.addTransitions('settings_popup', [
    {from: "visible", to: "invisible", object: settings_popup, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('fadeIn');
        o.classList.add('fadeOut');
    },  delay: 300},
    {from: "invisible", to: "visible", object: settings_popup, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('fadeOut');
        o.classList.add('fadeIn');
    }, delay: 300}
], 'visible');

var timeout_id;

function playerMouseMove() {
    state_machine.transition('controls', 'visible');
    clearTimeout(timeout_id);

    timeout_id = setTimeout(function() {
        state_machine.transition('controls', 'invisible');
    }, 3000);
}

player.addEventListener('mousemove', playerMouseMove);

controls.addEventListener('mouseover', function() {
    state_machine.transition('controls', 'frozen');
});

controls.addEventListener('mouseout', function() {
    state_machine.transition('controls', 'visible');
});

timeout_id = setTimeout(function() {
    state_machine.transition('controls', 'invisible');
}, 3000);

player.addEventListener('pause', function () {
    state_machine.transition('play_pause', 'paused');
});

player.addEventListener('play', function () {
    state_machine.transition('play_pause', 'playing');
    if(dash) {

        var bitrates = dash.getBitrateInfoListFor("video");
        console.log(bitrates);
        var option = document.createElement('option');
        option.value = -1;
        option.innerText = "Auto"
        bitrate_selection.appendChild(option);
        option.selected = "selected";

        for(var i = 0; i < bitrates.length; i++) {
            var option = document.createElement('option');
            option.value = bitrates[i].qualityIndex;
            option.innerText = bitrates[i].height;
            bitrate_selection.appendChild(option);
        }
    }
});

play_pause.addEventListener('click', playPause);

function playPause() {
    if(state_machine.getState('play_pause') == 'paused') {
        player.play();
    } else {
        player.pause();
    }
}

settings.addEventListener('mouseover', function() {
    state_machine.transition('settings_popup', 'visible');
});

settings.addEventListener('mouseout', function() {
    state_machine.transition('settings_popup', 'invisible');
});

state_machine.addTransitions('la_url_form', [
    {from: "visible", to: "invisible", object: la_url_toggle_btn, handle: function(transition) {
        la_url_form.classList.add('fadeOutUp');
        reload_source_la_url_btn.removeEventListener('click', reloadPlayer);
    }},
    {from: "invisible", to: "visible", object: la_url_toggle_btn, handle: function(transition) {
        la_url_form.classList.remove('collapsed');
        la_url_form.classList.add('animated', 'fadeInDown');
        reload_source_la_url_btn.addEventListener('click', reloadPlayer);
    }}
], 'invisible');


state_machine.addTransitions('media_url_form', [
    {from: "visible", to: "invisible", object: media_url_form, handle: function(transition) {
        media_url_form.classList.add('fadeOutUp');
        reload_source_media_url_btn.removeEventListener('click', reloadPlayer);
    }},
    {from: "invisible", to: "visible", object: media_url_form, handle: function(transition) {
        media_url_form.classList.remove('collapsed');
        media_url_form.classList.add('animated', 'fadeInDown');
        reload_source_media_url_btn.addEventListener('click', reloadPlayer);
    }}
], 'invisible');

la_url_toggle_btn.addEventListener('click', function() {
    state_machine.transition('la_url_form', 'visible');
});

media_url_toggle_btn.addEventListener('click', function() {
    state_machine.transition('media_url_form', 'visible');
});

$('select').material_select();

playback_speed.addEventListener('change', function() {
    console.log(playback_speed.value);
    player.playbackRate = playback_speed.value;
});

bitrate_selection.addEventListener('change', function() {
    console.log(bitrate_selection.value);
    
    if(dash != null) {
        if(bitrate_selection.value == -1) {
            dash.setAutoSwitchQuality(false);
        }

        dash.setAutoSwitchQuality(false);
        dash.setQualityFor("video", bitrate_selection.value);
    }
});