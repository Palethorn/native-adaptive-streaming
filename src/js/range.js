var Range = function(options) {
    if(options.min_value > options.max_value) {
        throw "max_value must be larger than min_value";
    }

    if(options.value > options.max_value || options.value < options.min_value) {
        throw "Default value out of range";
    }

    var self = this;
    this.seek_lock = false;
    this.options = options;
    this.value = options.value;
    this.min_value = options.min_value;
    this.max_value = options.max_value;
    this.type = options.type;

    this.path = document.createElement('div');
    this.path.style.border = '1px solid white';
    this.path.style.cursor = 'pointer';

    this.fill = document.createElement('div');

    this.thumb = document.createElement('div');
    this.thumb.style.borderRadius = '100%';
    // this.thumb.style.border = '5px solid white';
    // this.thumb.style.backgroundColor = '#ff7777';
    this.thumb.style.backgroundColor = 'red';
    this.thumb.style.width = '15px';
    this.thumb.style.height = '15px';

    this.thumb.style.cursor = 'pointer';

    if(this.options.type == 'horizontal') {
        this.path.style.height = '4px';
        this.path.style.width = '100%';
        this.fill.style.height = '4px';
        this.fill.style.float = 'left';
        this.fill.borderRadius = '0 100%';
        this.thumb.style.float = 'left';
        this.thumb.style.marginLeft = '-10px';
        this.thumb.style.marginTop = '-6px';
        this.fill.style.backgroundColor = 'white';
    }

    if(this.options.type == 'vertical') {
        this.path.style.width = '4px';
        this.path.style.height = '100%';
        this.path.style.backgroundColor = 'white';
        this.fill.style.width = '2px';
        this.fill.style.height = '100%';
        this.fill.borderRadius = '100% 100% 0 0';
        this.thumb.style.marginLeft = '-6px';
        this.thumb.style.marginTop = '-10px';
        this.fill.style.backgroundColor = 'black';
    }

    this.path.appendChild(this.fill);
    this.path.appendChild(this.thumb);
    this.options.target.appendChild(this.path);
    this.options.target.className = this.options.target_classlist;

    this.setValue = function(value) {
        if(self.seek_lock) {
            return;
        }

        if(this.type == 'vertical') {
            value = this.max_value - value;
        }

        if(value > this.max_value && value < this.min_value) {
            return;
        }
        
        this.value = value;
        this.percentage = (value - this.min_value) / (this.max_value - this.min_value);

        if(this.type == 'vertical') {
            this.fill.style.height = (this.percentage * 100) + '%';
        }

        if(this.type == 'horizontal') {
            this.fill.style.width = (this.percentage * 100) + '%';
        }
    }

    this.setPercentage = function(percentage) {
        if(percentage < 0) {
            percentage = 0;
        }

        if(percentage > 1) {
            percentage = 1;
        }

        this.value = percentage * (this.max_value - this.min_value)
        this.percentage = percentage;

        if(this.type == 'vertical') {
            this.fill.style.height = (this.percentage * 100) + '%';
        }

        if(this.type == 'horizontal') {
            this.fill.style.width = (this.percentage * 100) + '%';
        }
    }

    this.seekMouseUp = function(e) {
        window.removeEventListener('mouseup', self.seekMouseUp);
    
        if(!self.seek_lock) {
            return;
        }
       
        self.seek_lock = false;
        window.removeEventListener('mousemove', self.updateProgressPosition);

        if(self.options.valueChanged != undefined) {
            if(self.type == 'horizontal') {
                self.options.valueChanged(self.value);
            }

            if(self.type == 'vertical') {
                self.options.valueChanged(self.max_value - self.value);
            }
        }
    }
    
    this.updateProgressPosition = function(e) {
        var rect = self.options.target.getBoundingClientRect();

        if(self.type == 'horizontal') {
            self.setPercentage((e.clientX - rect.left) / rect.width);
        }

        if(self.type == 'vertical') {
            self.setPercentage((e.clientY - rect.top) / rect.height);
        }
    }
    
    this.options.target.addEventListener('mousedown', function(e) {
        if(e.which != 1) {
            return;
        }
        
        self.seek_lock = true;
        var rect = self.options.target.getBoundingClientRect();
        window.addEventListener('mousemove', self.updateProgressPosition, false);
        window.addEventListener('mouseup', self.seekMouseUp, false);

        if(self.type == 'horizontal') {
            self.setPercentage((e.clientX - rect.left) / rect.width);
        }

        if(self.type == 'vertical') {
            self.setPercentage((e.clientY - rect.top) / rect.height);
        }

    }, false);
}