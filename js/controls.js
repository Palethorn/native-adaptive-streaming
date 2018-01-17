var controls_state_machine = new StateMachine([
    {from: "visible", to: "invisible", object: controls, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('fadeIn');
        o.classList.add('animation-delay', 'fadeOut');
    },  delay: 3000},
    {from: "invisible", to: "visible", object: controls, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('animation-delay', 'fadeOut');
        o.classList.add('fadeIn');
    }, delay: 0},
    {from: "visible", to: "frozen", object: controls, handle: function(transition) {
        var o = transition.object;
        o.classList.remove('animation-delay', 'fadeOut', 'fadeIn');
    }, delay: 0},
    {from: "frozen", to: "invisible", object: controls, handle: function(transition) {
        var o = transition.object;
        o.classList.add('animation-delay', 'fadeOut');
    }, delay: 0}
], "visible");

function controlsAnimationEnd() {
    controls_state_machine.transition("invisible");
}

function playerMouseMove() {
    controls_state_machine.transition("visible");
}

controls.addEventListener('animationend', controlsAnimationEnd);
player.addEventListener('mousemove', playerMouseMove);
controls.addEventListener('mouseover', function() {
    controls_state_machine.transition('frozen');
});
controls.addEventListener('mouseout', function() {
    controls_state_machine.transition('invisible');
});
controls_state_machine.transition("invisible");

var play_pause_state_machine = new StateMachine([
    {from: "playing", to: "paused", object: play_pause, handle: function(transition) {
        transition.object.innerText = "play_arrow";
    }},
    {from: "paused", to: "playing", object: play_pause, handle: function(transition) {
        transition.object.innerText = "pause";
    }}
], "paused");

player.addEventListener('pause', function () {
    play_pause_state_machine.transition('paused');
});

player.addEventListener('play', function () {
    play_pause_state_machine.transition('playing');
});

play_pause.addEventListener('click', playPause);

function playPause() {
    if(play_pause_state_machine.current_state == 'paused') {
        player.play();
    } else {
        player.pause();
    }
}

var settings_popup_state_machine = new StateMachine([
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
]);

settings.addEventListener('mouseover', function() {
    settings_popup_state_machine.transition('visible');
});

settings.addEventListener('mouseout', function() {
    settings_popup_state_machine.transition('invisible');
});