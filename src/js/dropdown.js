var Dropdown = function(settings) {
    this.target = settings.target;
    this.selected_element = null;
    this.value = null;
    this.settings = settings;
    this.target.style.overflow = 'hidden';
    this.target.style.height = 41 + 'px';
    this.state = 0;
    this.mainElement = null;

    this.init = function() {
        if(this.settings.options == undefined) {
            this.settings.options = [];
        }

        var a = document.createElement('a');
        a.classList.add('waves-effect', 'waves-red', 'btn-flat', 'dropdown-label');
        a.innerText = this.settings.label;
        var div = document.createElement('div');
        div.appendChild(a);
        this.target.appendChild(div);
        a.addEventListener('click', this.toggle);
    
        this.mainElement = div;

        for(var i = 0; i < this.settings.options.length; i++) {
            this.initOption(this.settings.options[i]);
        }
    }

    this.initOption = function(opt) {
        var div = document.createElement('div');
        div.style.paddingLeft = '20px';
        var a = document.createElement('a');
        a.classList.add('waves-effect', 'waves-red', 'btn-flat', 'dropdown-option');
        a.setAttribute('data-value', opt.value);
        a.setAttribute('data-label', opt.label);
        a.innerText = opt.label;
        div.appendChild(a);
        this.target.appendChild(div);

        if(opt.selected === true) {
            this.selected_element = div;
            div.classList.add('selected');
            _self.mainElement.firstChild.innerText = _self.settings.label + ': ' + opt.label;
        }

        a.addEventListener('click', this.clicked);
    }

    this.addOption = function(opt) {
        this.settings.options.push(opt);
        this.initOption(opt);
    }

    var _self = this;

    this.clicked = function(e) {
        var el = e.target.parentNode;
        _self.selected_element.classList.remove('selected');
        _self.selected_element = el;
        _self.selected_element.classList.add('selected');

        if(_self.settings.onChange !== undefined) {
            _self.settings.onChange({
                selected_element: el,
                value: e.target.getAttribute('data-value')
            });
        }

        _self.mainElement.firstChild.innerText = _self.settings.label + ': ' + e.target.getAttribute('data-label')
        // _self.toggle();
    }

    this.addEventListener = function(type, callback) {
        switch(type) {
            case 'change':
                this.settings.onChange = callback;
        }
    }

    this.toggle = function() {
        if(_self.state == 0) {
            _self.open();
            _self.state = 1;
            return;
        }

        _self.close();
        _self.state = 0;
    }

    this.open = function() {
        this.target.style.height = ((this.settings.options.length + 1) * 41) + 'px';
    }

    this.close = function() {
        this.target.style.height = 41 + 'px';
    }

    this.clear = function() {
        clearNode(this.target);
        this.settings.options = [];
        this.init();
    }

    this.init();
}