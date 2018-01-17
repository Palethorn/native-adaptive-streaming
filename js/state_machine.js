var StateMachine = function(transitions, current_state) {
    this.transitions = transitions;
    this.current_state = current_state;
    this.timeout_id = null;

    this.transition = function(to) {
        for(var i = 0; i < this.transitions.length; i++) {
            var transition = this.transitions[i];

            if(transition.to == to) {
                if(transition.from != this.current_state) {
                    continue;
                }

                console.log(transition);
                transition.handle(transition);
                var _self = this;
                clearTimeout(this.timeout_id);
                this.timeout_id = setTimeout(function() {
                    _self.current_state = to;
                }, transition.delay);
                
                break;
            }
        }
    }
}