var state_machine = new StateMachine({
    debug: false
});
var seek_lock = false;
var seek_position = null;

function clearNode(target) {
    while(target.hasChildNodes()) {
        target.removeChild(target.lastChild);
    }
}

var headers = {};