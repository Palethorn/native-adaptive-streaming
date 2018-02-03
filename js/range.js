var Range = function(options) {
    var self = this;
    this.seek_lock = false;
    this.options = options;
    this.value = options.value;
    this.min_value = options.min_value;
    this.max_value = options.max_value;
    this.type = options.type;

    this.line = document.createElement('div');
    this.line.style.border = '1px solid #ff7777';
    this.line.style.height = '8px';
    this.line.style.marginTop = '25px';
    this.line.style.cursor = 'pointer';

    this.path = document.createElement('div');
    this.path.style.height = '8px';
    this.path.style.backgroundColor = '#ff7777';
    this.path.style.float = 'left';
    this.line.appendChild(this.path);

    this.thumb = document.createElement('div');
    this.thumb.style.borderRadius = '100%';
    this.thumb.style.border = '5px solid #ff7777';
    this.thumb.style.backgroundColor = 'white';
    this.thumb.style.width = '20px';
    this.thumb.style.height = '20px';
    this.thumb.style.float = 'left';
    this.thumb.style.marginLeft = '-2px';
    this.thumb.style.marginTop = '-6px';
    this.thumb.style.cursor = 'pointer';
    this.line.appendChild(this.thumb);

    this.options.target.appendChild(this.line);
    this.options.target.className = this.options.target_classlist;

    this.setValue = function(value) {
        if(self.seek_lock) {
            return;
        }

        if(value > this.max_value && value < this.min_value) {
            console.log('Value out of range');
            return;
        }
        
        this.value = value;
        this.percentage = (value - this.min_value) / (this.max_value - this.min_value);

        if(this.type == 'vertical') {
            this.path.style.height = (this.percentage * 100) + '%';
        }

        if(this.type == 'horizontal') {
            this.path.style.width = (this.percentage * 100) + '%';
        }
    }

    this.setPercentage = function(percentage) {
        this.value = percentage * (this.max_value - this.min_value);
        this.percentage = percentage;

        if(this.type == 'vertical') {
            this.path.style.height = (this.percentage * 100) + '%';
        }

        if(this.type == 'horizontal') {
            this.path.style.width = (this.percentage * 100) + '%';
        }
    }

    this.seekMouseUp = function(e) {
        window.removeEventListener('mouseup', self.seekMouseUp);
    
        if(!self.seek_lock) {
            return;
        }
       
        self.seek_lock = false;
        window.removeEventListener('mousemove', self.updateProgressPosition);
        var rect = self.options.target.getBoundingClientRect();

        if(self.options.valueChanged != undefined) {
            self.options.valueChanged(self.value);
        }
    }
    
    this.updateProgressPosition = function(e) {
        var rect = progress.getBoundingClientRect();
        self.setPercentage((e.clientX - rect.left) / rect.width);
    }
    
    this.options.target.addEventListener('mousedown', function(e) {
        if(e.which != 1) {
            return;
        }
        
        self.seek_lock = true;
        var rect = self.options.target.getBoundingClientRect();
        window.addEventListener('mousemove', self.updateProgressPosition, false);
        window.addEventListener('mouseup', self.seekMouseUp, false);
        self.setPercentage((e.clientX - rect.left) / rect.width);
    }, false);
}