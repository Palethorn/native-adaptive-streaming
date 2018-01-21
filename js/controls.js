state_machine.addTransitions('controls', [
    {from: "visible", to: "invisible", object: controls, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('fadeIn');
        o.classList.add('animation-delay', 'fadeOut');
    },  delay: 3000},
    {from: "invisible", to: "visible", object: controls, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('animation-delay', 'fadeOut');
        o.classList.add('fadeIn');
    }},
    {from: "visible", to: "frozen", object: controls, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('animation-delay', 'fadeOut', 'fadeIn');
    }},
    {from: "frozen", to: "invisible", object: controls, handle: function(transition) {
        var o = transition.object;
        o.classList.add('animation-delay', 'fadeOut');
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

function controlsAnimationEnd() {
    state_machine.transition('controls', 'invisible');
}

function playerMouseMove() {
    state_machine.transition('controls', 'visible');
}

controls.addEventListener('animationend', controlsAnimationEnd);
player.addEventListener('mousemove', playerMouseMove);

controls.addEventListener('mouseover', function() {
    state_machine.transition('controls', 'frozen');
});

controls.addEventListener('mouseout', function() {
    state_machine.transition('controls', 'invisible');
});

state_machine.transition('controls', 'invisible');


player.addEventListener('pause', function () {
    play_pause_state_machine.transition('play_pause', 'paused');
});

player.addEventListener('play', function () {
    state_machine.transition('play_pause', 'playing');
});

play_pause.addEventListener('click', playPause);

function playPause() {
    if(play_pause_state_machine.current_state == 'paused') {
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