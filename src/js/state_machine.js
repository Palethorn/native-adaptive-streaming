var StateMachine = function(options) {
    this.transitions = {};
    this.debug = options.debug != undefined && options.debug ? true : false;

    this.log = function(msg) {
        if(this.debug) {
            console.log(msg);
        }
    }

    this.addTransitions = function (namespace, definitions, state) {
        this.transitions[namespace] = {};
        this.transitions[namespace].timeout_id = null;
        this.transitions[namespace].state = state;
        this.transitions[namespace].definitions = definitions;
    }

    this.lock = function(namespace, state) {
        this.transition(namespace, state);
        this.transitions[namespace].locked = true;
    }

    this.getState = function(namespace) {
        return this.transitions[namespace].state;
    }

    this.setState = function(namespace, state) {
        this.transitions[namespace].state = state;
    }

    this.transition = function(namespace, to) {
        var transitions = this.transitions[namespace];
        
        if(transitions.locked != undefined && transitions.locked) {
            return
        }

        for(var i = 0; i < transitions.definitions.length; i++) {
            var definition = transitions.definitions[i];

            if(definition.to == to) {
                if(definition.from != transitions.state) {
                    continue;
                }

                this.log(definition);
                definition.handle(definition);
                clearTimeout(transitions.timeout_id);
                
                if(definition.delay != undefined) {
                    transitions.timeout_id = setTimeout(function() {
                        transitions.state = to;
                    }, definition.delay);
                } else {
                    transitions.state = to;
                }

                break;
            }
        }
    }

    this.setDebug = function(debug) {
        this.debug = debug;
    }
}