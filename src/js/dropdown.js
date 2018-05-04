var Dropdown = function(settings) {
    this.target = settings.target;
    this.selected_element = null;
    this.value = null;
    this.settings = settings;
    this.target.style.overflow = 'hidden';
    this.target.style.height = 36 + 'px';
    this.state = 0;

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
    
        for(var i = 0; i < this.settings.options.length; i++) {
            this.initOption(this.settings.options[i]);
        }
    }

    this.initOption = function(opt) {
        var div = document.createElement('div');
        var a = document.createElement('a');
        a.classList.add('waves-effect', 'waves-red', 'btn-flat', 'dropdown-option');
        a.setAttribute('data-value', opt.value);
        a.innerText = opt.label;
        div.appendChild(a);
        this.target.appendChild(div);
    }

    this.addOption = function(opt) {
        this.settings.options.push(opt);
        this.initOption(opt);
    }

    var _self = this;

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
        this.target.style.height = ((this.settings.options.length + 1) * 36) + 'px';
    }

    this.close = function() {
        this.target.style.height = 36 + 'px';
    }

    this.clear = function() {
        this.target.innerHTML = '';
        this.settings.options = [];
        this.init();
    }

    this.init();
}