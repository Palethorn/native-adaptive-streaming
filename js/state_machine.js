var StateMachine = function() {
    this.transitions = {};

    this.addTransitions = function (namespace, definitions, state) {
        this.transitions[namespace] = {};
        this.transitions[namespace].timeout_id = null;
        this.transitions[namespace].state = state;
        this.transitions[namespace].definitions = definitions;
    }

    this.getState = function(namespace) {
        return this.transitions[namespace].state;
    }

    this.transition = function(namespace, to) {
        var transitions = this.transitions[namespace];
        
        for(var i = 0; i < transitions.definitions.length; i++) {
            var definition = transitions.definitions[i];

            if(definition.to == to) {
                if(definition.from != transitions.state) {
                    continue;
                }

                console.log(definition);
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
}