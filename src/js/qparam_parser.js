var qparam_parser = function() {
    this.parse = function(query) {
        var vars = query.split('&');
        var pairs = {};

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            pairs[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }

        return pairs;
    }
}
