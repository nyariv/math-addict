renderer = {
    updateView: function(context){
        
        renderer.updateElement('init' ,context, function($elem, val) {
            val();
        }, true, true);
    
        renderer.updateElement('show' ,context, function($elem, val) {
            if(val) {
                if($elem.data('initial-display')) {
                    $elem.css('display', $elem.data('initial-display'));
                }
            } else {
                if(!$elem.data('initial-display')) {
                    $elem.data('initial-display', $elem.css('display'));
                }
                $elem.css('display', 'none');
            }
        });

        renderer.updateElement('if' ,context, function($elem, val) {
            var contents = $elem.data('contents');
            if(val) {
                if(contents) {
                    $elem.html(contents);
                    renderer.updateView($elem);
                    $elem.data('contents', null);
                }
            } else {
                if(!contents) {
                    contents = $elem.html();
                    $elem.data('contents', contents);
                }
                $elem.empty();
            }
        });

        renderer.updateElement('dir' ,context, function($elem, val) {
            $elem.attr('dir', val);
        });
        
        renderer.updateElement("equation", context, function($elem, val) {
            $elem.css('visibility', 'hidden');
            katex.render(val, $elem[0]);
            $elem.css('visibility', 'visible');
        });
        renderer.updateElement("text", context, function($elem, val) {
            $elem.text(renderer.translate(val));
        });
        renderer.updateElement("var", context, function($elem, val) {
            $elem.text(val);
        });

        renderer.updateElement("phone", context, function($elem, val) {

            $elem.on('change keyup', function(e){
                var phone = new libphonenumber.asYouType('IL').input($elem.val());
                $elem.val(phone);
            });

        }, false, true);
    
        renderer.updateElement("html", context, function($elem, val) {
            $elem.html(val);
            renderer.updateView($elem.get(0))
        });
    
        renderer.updateElement("class", context, function($elem, val) {
            $elem.attr('class', val);
        });
    
        renderer.updateElement("pref", context, function($elem, val) {
            $elem.addClass('pref-link')
            $elem.on('click', function (e) {
                renderer.changePage(val);
                app.closeMenu();
            });
        }, false, true);
        
        renderer.updateElement("select", context, function($elem, val) {
            var oldVal = $elem.data('select-prev');
            var same = false;
            if(!oldVal || (same = JSON.stringify(oldVal) === JSON.stringify(val))) {
                var current = (same && $(this).val()) || '';
                $elem.empty();
                for(var i in val) {
                    $elem.append("<option value='" + val[i].value + "'>" + renderer.translate(val[i].label) + "</option>");
                }
                if(same) {
                    $elem.val(current);
                }
                $elem.data('select-prev', val);
            }
        });

        renderer.updateElement("input", context, function($elem, val) {
            var attr = $elem.attr('data-input');
            $elem.on('change keyup', function(e){
                renderer.parseVar(attr, state, $elem.val());
                renderer.updateView();
            });
            $elem.val(val);
            if((typeof renderer.parseVar(attr, state) === 'undefined')) {
                renderer.parseVar(attr, state, $elem.val());
            }
        }, false, true);
        
        renderer.updateElement('repeat', context, function($elem, val){
            $elem.empty();
            for(var i in val) {
                var item = val[i];
                var $newElem = $('<' + item.tag + '>');
                for (var a in item.attributes || {}) {
                    $newElem.attr(a, item.attributes[a]);
                }
                $newElem.html(item.content || '');
                $elem.append($newElem);
                renderer.updateView($newElem.get(0));
            }
        });

        renderer.updateElement('auto-focus', context, function($elem, val) {
            $elem.focus();
        }, false, true);
    
        renderer.updateElement('include', context, function($elem, val) {
            var prev = $elem.data('include-prev');
            if(prev !== val) {   
                $elem.load(val + '?_=' + time, {}, function(){
                    renderer.updateView($elem.get(0));
                });
                prev = $elem.data('prev', val);
            }
        });

        renderer.updateElement('trigger', context, function($elem, val) {
            $elem.on('click', function(e){
                val(e);
                e.preventDefault();
                renderer.updateView();
            });
            $elem.on('mousedown touchstart', function(e){
                $elem.addClass('active');
            });
            $elem.on('mouseup touchend', function(e){
                $elem.removeClass('active');
            });
        }, true, true);

        renderer.updateElement('click' ,context, function($elem, val) {
            $elem.on('mousedown touchstart', function(e){
                if(val) {
                    val(e);
                }
                renderer.updateView();
                $elem.addClass('active');
            });
            $elem.on('mouseup touchend', function(e){
                $elem.removeClass('active');
            });

            $elem.on('click', function(e) {
                e.preventDefault();
            });
        }, true, true);
        
        var events = [
            'keydown',
            'focus',
            'change',
            'submit'
        ];
        
        for(var i = 0; i<events.length; i++) {
            var event = events[i];
            renderer.updateElement(event ,context, function($elem, val) {
                $elem.on(event, function(e){
                    if(val) {
                        val(e);
                    }
                    renderer.updateView();
                });
            }, true, true);
        }
        
    },
    updateElement: function (name, context, callback, useApp, once) {
        context = context || document;
        $("[data-" + name + "]", context).each(function(){
            var $elem = $(this);
            if(!once || !$elem.data(name + '-processed')) {
                var val = renderer.parseVar($elem.data(name), useApp ? app : state);
                var prevVal = $elem.data(name + '-val');
                if((prevVal !== val) || ($elem.data(name) === '') || typeof val === 'undefined') {
                    $elem.data(name + '-val', val);
                    callback($elem, val);
                }
            }
            if(once) {
                $elem.data(name+'-processed', true);
            }
        });
        
    },
    parseVar: function (string, object, set) {
        object = object || state;
        var negate = false;

        if(string[0] === '!') {
            negate = true;
            string = string.substring(1, string.length);
        }

        if(string[0] === "'") {
            return string.substring(1, string.length-1);
        }
        
        var parts = string.split('.');
        var val = object;
        for(var i = 0; i < parts.length; i++) {
    
            if((typeof set != 'undefined') && i == (parts.length - 1)) {
                val[parts[i]] = set;
            }
            
            if(typeof val !== 'undefined') {
                val = val[parts[i]];
            }
        }
        
        if(negate) {
            return !val;
        }
        return val;
    },
    translate: function(string) {
        if(state.language === 'he-IL') {
            return translations[string] || string;
        } else {
            return string;
        }
    },
    changePage: function(pageName) {
        var lastPage = state.currentPage;
        state.currentPage = pageName;
        state.page = data.pages[pageName];
        if(lastPage !== pageName) {
            renderer.listeners = {};
            if(app[state.page.init]) {
                app[state.page.init]();
            }
            renderer.updateView();
        }
    },
    listeners: {},
    listen: function (name, callback) {
        renderer.listeners[name] = renderer.listeners[name] || [];
        renderer.listeners[name].push(callback);
    },
    trigger: function(name, args) {
        if(renderer.listeners[name]) {
            for(var i in renderer.listeners[name]) {
                renderer.listeners[name][i].apply(app, args);
            }
        }
        renderer.updateView();
    },
    
};