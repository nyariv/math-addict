var time = new Date().getTime();
$.when($.getScript('js/assets.js'), $.getScript('js/app/app.js')).then(function(){
    
    var promises = [];

    scripts.map(function(src) {
        promises.push($.getScript(src));
    });

    stylesheets.map(function(src) {
        promises.push(getStyleSheet(src));
    });

    $.when.apply($, promises).then(function(){
        $.getScript('js/index.js');
    });


    function getStyleSheet(src) {
        var $d = $.Deferred();

        var $link = $('<link/>', {
           rel: 'stylesheet',
           type: 'text/css',
           href: src + '?_=' + time
        }).on('load', $d.resolve).appendTo('head');

        return $d.promise();
    }
});

