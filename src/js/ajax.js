function Ajax() {
    this.get = function(options) {
        this.options = options;
        this.xhttp = new XMLHttpRequest();
        self = this;

        this.xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                self.options.success(this.responseText);
            }
        };

        this.xhttp.open("GET", this.options.url, true);
        this.xhttp.send();
    }
}