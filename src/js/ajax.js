function Ajax() {

    this.get = function(options) {
        var xhttp = new XMLHttpRequest();
        self = this;

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log(self);
                options.success(this.responseText);
            }
        };

        xhttp.open("GET", options.url, true);
        xhttp.send();
    }
}