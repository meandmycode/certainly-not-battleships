(function() {

    // devnote: getElementsByTagName returns a 'live' node list, so it will always represents ALL scripts on the page when iterated
    var scripts = document.getElementsByTagName('script');

    // via https://gist.github.com/creationix/7435851
    function resolvePath() {

        // reduce all the path parts by essentially concatenating them all and splitting them by the directory separator
        var parts = [].slice.call(arguments, 0).reduce(function(path, part) {
            return path.concat(part.split('/'));
        }, []);

        var newParts = [];

        for (var i = 0, l = parts.length; i < l; i++) {

            var part = parts[i];

            // remove leading and trailing slashes as well as '.' segments
            if (!part || part === '.') continue;

            // 'parent' segment should pop a part
            if (part === '..') newParts.pop();

            else newParts.push(part);
        }

        // preserve the initial slash if there was one
        if (parts[0] === '') newParts.unshift('');

        return newParts.join('/') || (newParts.length ? '/' : '.');
    }

    function getDirectory(path) {
        return path.split('/').slice(0, -1).join('/') + '/';
    }

    function parseUri(uri) {
        var anchor = document.createElement('a');
        anchor.setAttribute('href', uri);
        return anchor;
    }

    function getCurrentScriptPath() {
        var currentScript = scripts[scripts.length - 1];
        var path = parseUri(currentScript.src).pathname;
        return path[0] === '/' ? path : '/' + path;
    }

    var warehouse = {};
    var awaiters = {};

    function load(path, callback) {

        var el = document.createElement('script');
        el.onload = callback;
        el.src = path;

        var lastScript = scripts[scripts.length - 1];

        var parent = lastScript.parentNode;
        var nextSibling = lastScript.nextSibling;

        if (nextSibling != null) {
            parent.insertBefore(el, nextSibling);
        } else {
            parent.appendChild(el);
        }

    }

    window.plsload = function(dependencies, callback) {

        var resolved = [];
        var currentPath = getCurrentScriptPath();

        var exports = warehouse[currentPath] = {};

        var handler = function() {
            callback.apply(this, resolved);
            var awaiter = awaiters[currentPath];
            if (awaiter) awaiter(exports);
        };

        // resolves the next dependency required, this loading forces dependencies to be loaded one after another,
        // this wouldn't be great in production but this plsload is designed specifically for development.
        function resolveNext() {

            var dependency = dependencies.shift();

            if (dependency == null) return handler();

            if (dependency === 'exports') return resolved.push(exports) && resolveNext();

            var src = resolvePath(getDirectory(currentPath), dependency);

            // ensure the path ends with .js
            if (src.slice(-3) !== '.js') src = src + '.js';

            var ready = awaiters[src] = function(exports) {
                resolved.push(exports);
                resolveNext();
            };

            // if the src has already loaded we can ready immediately
            if (src in warehouse) return ready(warehouse[src])

            load(src, function() {

                // if this wasn't a plsload script then complete it now
                if (warehouse[src] == null) return ready(warehouse[src] = null);

            });

        }

        resolveNext();

    };

})();
