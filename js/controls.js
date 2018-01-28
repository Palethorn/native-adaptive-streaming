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

video_element.addEventListener('mousemove', playerMouseMove);

controls.addEventListener('mouseover', function() {
    state_machine.transition('controls', 'frozen');
});

controls.addEventListener('mouseout', function() {
    state_machine.transition('controls', 'visible');
});

timeout_id = setTimeout(function() {
    state_machine.transition('controls', 'invisible');
}, 3000);

video_element.addEventListener('pause', function () {
    state_machine.transition('play_pause', 'paused');
});

video_element.addEventListener('play', function () {
    state_machine.transition('play_pause', 'playing');
    console.log(video_element.duration);
    console.log(player.getTech().getPlayer().isDynamic());
    /*if(dash) {

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
    }*/
});

play_pause.addEventListener('click', playPause);

function playPause() {
    if(state_machine.getState('play_pause') == 'paused') {
        video_element.play();
    } else {
        video_element.pause();
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

state_machine.addTransitions('subtitles_url_form', [
    {from: "visible", to: "invisible", object: subtitles_url_form, handle: function(transition) {
        subtitles_url_form.classList.add('fadeOutUp');
        reload_source_media_url_btn.removeEventListener('click', reloadPlayer);
    }},
    {from: "invisible", to: "visible", object: subtitles_url_form, handle: function(transition) {
        subtitles_url_form.classList.remove('collapsed');
        subtitles_url_form.classList.add('animated', 'fadeInDown');
        load_subtitles_url_btn.addEventListener('click', loadSubtitles);
    }}
], 'invisible');

la_url_toggle_btn.addEventListener('click', function() {
    state_machine.transition('la_url_form', 'visible');
});

subtitles_toggle_btn.addEventListener('click', function() {
    state_machine.transition('subtitles_url_form', 'visible');
});

media_url_toggle_btn.addEventListener('click', function() {
    state_machine.transition('media_url_form', 'visible');
});

playback_speed.addEventListener('change', function() {
    console.log(playback_speed.value);
    video_element.playbackRate = playback_speed.value;
});

bitrate_selection.addEventListener('change', function() {
    console.log(bitrate_selection.value);
    
    if(dash != null) {
        if(bitrate_selection.value == -1) {
            dash.setAutoSwitchQuality(true);
            return;
        }

        dash.setAutoSwitchQuality(false);
        dash.setQualityFor("video", bitrate_selection.value);
    }
});

volume.addEventListener('mouseover', function() {
    volume_popup.classList.remove('collapsed', 'fadeOut');
    volume_popup.classList.add('animated', 'fadeIn');
});

volume.addEventListener('mouseout', function() {
    volume_popup.classList.remove('fadeIn');
    volume_popup.classList.add('animated', 'fadeOut');
});

settings.addEventListener('mouseover', function() {
    settings_popup.classList.remove('collapsed', 'fadeOut');
    settings_popup.classList.add('animated', 'fadeIn');
});

settings.addEventListener('mouseout', function() {
    settings_popup.classList.remove('fadeIn');
    settings_popup.classList.add('animated', 'fadeOut');
});

state_machine.addTransitions('window', [
    {from: "fullscreen", to: "windowed", object: settings_popup, handle: function(transition) {
        if(document.exitFullscreen) {
            document.exitFullscreen();
        } else if(document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if(document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }},
    {from: "windowed", to: "fullscreen", object: settings_popup, handle: function(transition) {
        if (body.requestFullscreen) {
            body.requestFullscreen();
        }
        else if (body.mozRequestFullScreen) {
            body.mozRequestFullScreen();
        }
        else if (body.webkitRequestFullscreen) {
            body.webkitRequestFullscreen();
        }
    }}
], 'windowed');

var fullscreen_clicked = false;

fullscreen_toggle_btn.addEventListener('click', function() {
    fullscreen_clicked = true;

    if(state_machine.getState('window') == 'windowed') {
        state_machine.transition('window', 'fullscreen');
    } else {
        state_machine.transition('window', 'windowed');
    }
});

window.addEventListener('webkitfullscreenchange', fullscreenExitHandler, false);
window.addEventListener('mozfullscreenchange', fullscreenExitHandler, false);
window.addEventListener('fullscreenchange', fullscreenExitHandler, false);

function fullscreenExitHandler() {
    if(body.webkitIsFullScreen || body.mozFullScreen || body.msFullscreenElement !== null && state_machine.getState('window') == 'fullscreen' && !fullscreen_clicked) {
        state_machine.setState('window', 'windowed');
    }

    fullscreen_clicked = false;
}