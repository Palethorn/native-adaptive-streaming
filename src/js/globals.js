var state_machine = new StateMachine({
    debug: true
});
var seek_lock = false;
var seek_position = null;
var user_volume = .5;
var player = null;

function clearNode(target) {
    while(target.hasChildNodes()) {
        target.removeChild(target.lastChild);
    }
}

var headers = {};
