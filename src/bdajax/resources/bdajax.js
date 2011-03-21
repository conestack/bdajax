/* 
 * bdajax
 * 
 * Requires: jquery tools
 */

(function($) {

    $(document).ready(function() {
        bdajax.spinner.hide();
        $(document).bdajax();
    });
    
    $.fn.bdajax = function() {
        var context = $(this);
        $('*', context).each(function() {
            for (var i in this.attributes) {
                var attr = this.attributes[i];
                if (attr && attr.nodeName) {
                    var name = attr.nodeName;
                    if (name.indexOf('ajax:bind') > -1) {
                        var events = attr.nodeValue;
                        var ajax = $(this);
                        ajax.unbind(events);
                        if (ajax.attr('ajax:action')) {
                            ajax.bind(events, bdajax._action_handler);
                        }
                        if (ajax.attr('ajax:event')) {
                            ajax.bind(events, bdajax._event_handler);
                        }
                    }
                }
            }
        });
        for (var binder in bdajax.binders) {
            bdajax.binders[binder](context);
        }
        return context;
    }
    
    bdajax = {
        
        // object for 3rd party binders
        binders: {},
        
        // ajax spinner handling
        spinner: {
            
            _elem: null,
            _request_count: 0,
            
            elem: function() {
                if (bdajax.spinner._elem == null) {
                    bdajax.spinner._elem = $('#ajax-spinner');
                }
                return bdajax.spinner._elem;
            },
            
            show: function() {
                bdajax.spinner._request_count++;
                if (bdajax.spinner._request_count > 1) {
                    return;
                }
                bdajax.spinner.elem().show();
            },
            
            hide: function(force) {
                bdajax.spinner._request_count--;
                if (force) {
                    bdajax.spinner._request_count = 0;
                    bdajax.spinner.elem().hide();
                    return;
                } else if (bdajax.spinner._request_count <= 0) {
                    bdajax.spinner._request_count = 0;
                    bdajax.spinner.elem().hide();
                }
            }
        },
        
        parseurl: function(url) {
            var idx = url.indexOf('?');
            if (idx != -1) {
                url = url.substring(0, idx);
            }
            return url;
        },
        
        parsequery: function(url) {
            var params = {};
            var idx = url.indexOf('?');
            if (idx != -1) {
                var parameters = url.slice(idx + 1).split('&');
                for (var i = 0;  i < parameters.length; i++) {
                    var param = parameters[i].split('=');
                    params[param[0]] = param[1];
                }
            }
            return params;
        },
        
        parsetarget: function(target) {
            var url = bdajax.parseurl(target);
            var params = bdajax.parsequery(target);
            if (!params) { params = {}; }
            return {
                url: url,
                params: params
            };
        },
        
        request: function(config) {
            if (config.url.indexOf('?') != -1) {
                var addparams = config.params;
                config.params = bdajax.parsequery(config.url);
                config.url = bdajax.parseurl(config.url);
                for (var key in addparams) {
                    config.params[key] = addparams[key];
                }
            } else {
                if (!config.params) { config.params = {}; }
            }
            if (!config.type) { config.type = 'html'; }
            if (!config.error) {
                config.error = function(req, status, exception) {
                    bdajax.error(req + ' ' + status + ' ' + exception);
                };
            }
            if (!config.cache) { config.cache = false; }
            var wrapped_success = function(data, status, request) {
                config.success(data, status, request);
                bdajax.spinner.hide();
            }
            var wrapped_error = function(request, status, error) {
                config.error(request, status, error);
                bdajax.spinner.hide(true);
            }
            bdajax.spinner.show();
            $.ajax({
                url: config.url,
                dataType: config.type,
                data: config.params,
                success: wrapped_success,
                error: wrapped_error,
                cache: config.cache
            });
        },
        
        action: function(config) {
            config.params['bdajax.action'] = config.name;
            config.params['bdajax.mode'] = config.mode;
            config.params['bdajax.selector'] = config.selector;
            var error = function(req, status, exception) {
                bdajax.error(req + ' ' + status + ' ' + exception);
            };
            bdajax.request({
                url: bdajax.parseurl(config.url) + '/ajaxaction',
                type: 'json',
                params: config.params,
                success: function(data) {
                    if (!data) {
                        bdajax.error('Empty response');
                    }
                    var mode = data.mode;
                    var selector = data.selector;
                    if (mode == 'replace') {
                        $(selector).replaceWith(data.payload);
                        var context = $(selector);
                        if (context.length) {
                            context.parent().bdajax();
                        } else {
                            $(document).bdajax();
                        }
                    } else if (mode == 'inner') {
                        $(selector).html(data.payload);
                        $(selector).bdajax();
                    }
                    bdajax.continuation(data.continuation);
                },
                error: error
            });
        },
        
        continuation: function(actions) {
            if (!actions) {
                return;
            }
            bdajax.spinner.hide();
            var action, target;
            for (var idx in actions) {
                action = actions[idx];
                if (action.type == 'action') {
                    target = bdajax.parsetarget(action.target);
                    bdajax.action({
                        url: target.url,
                        params: target.params,
                        name: action.name,
                        mode: action.mode,
                        selector: action.selector
                    });
                } else if (action.type == 'event') {
                    bdajax.trigger(action.name, action.selector, action.target);
                }
            }
        },
        
        trigger: function(name, selector, target) {
            var evt = $.Event(name);
            evt.ajaxtarget = bdajax.parsetarget(target);
            $(selector).trigger(evt);
        },
        
        overlay: function(options) {
            var elem = $('#ajax-overlay');
            elem.overlay({
                mask: {
                    color: '#fff',
                    loadSpeed: 200
                },
                onBeforeLoad: function() {
                    var target = bdajax.parsetarget(options.target);
                    bdajax.action({
                        name: options.action,
                        selector: '#ajax-overlay-content',
                        mode: 'inner',
                        url: target.url,
                        params: target.params
                    });
                },
                onClose: function() {
                    var overlay = this.getOverlay();
                    $('#ajax-overlay-content', overlay).html('');
                },
                oneInstance: false,
                closeOnClick: true
            });
            var overlay = elem.data('overlay');
            overlay.load();
            return overlay;
        },
        
        message: function(message) {
            var elem = $('#ajax-message');
            elem.overlay({
                mask: {
                    color: '#fff',
                    loadSpeed: 200
                },
                onBeforeLoad: function() {
                    var overlay = this.getOverlay();
                    $('.message', overlay).html(message);
                },
                oneInstance: false,
                closeOnClick: false,
                top:'20%'
            });
            elem.data('overlay').load();
        },
        
        error: function(message) {
            $("#ajax-message .message").removeClass('error warning info')
                                       .addClass('error');
            bdajax.message(message);
        },
        
        info: function(message) {
            $("#ajax-message .message").removeClass('error warning info')
                                       .addClass('info');
            bdajax.message(message);
        },
        
        warning: function(message) {
            $("#ajax-message .message").removeClass('error warning info')
                                            .addClass('warning');
            bdajax.message(message);
        },
        
        dialog: function(options, callback) {
            var elem = $('#ajax-dialog');
            elem.removeData('overlay');
            elem.overlay({
                mask: {
                    color: '#fff',
                    loadSpeed: 200
                },
                onBeforeLoad: function() {
                    var overlay = this.getOverlay();
                    var closefunc = this.close;
                    $('.text', overlay).html(options.message);
                    $('button', overlay).unbind();
                    $('button.submit', overlay).bind('click', function() {
                        closefunc();
                        callback(options);
                    });
                    $('button.cancel', overlay).bind('click', function() {
                        closefunc();
                    });
                },
                oneInstance: false,
                closeOnClick: false,
                top:'20%'
            });
            elem.data('overlay').load();
        },
        
        _event_handler: function(event) {
            event.preventDefault();
            var elem = $(this);
            var target = elem.attr('ajax:target');
            var defs = bdajax._defs_to_array(elem.attr('ajax:event'));
            for (var i = 0; i < defs.length; i++) {
                var def = defs[i];
                def = def.split(':');
                bdajax.trigger(def[0], def[1], target);
            }
        },
        
        _action_handler: function(event) {
            event.preventDefault();
            var elem = $(this);
            var target;
            if (event.ajaxtarget) {
                target = event.ajaxtarget;
            } else {
                target = bdajax.parsetarget(elem.attr('ajax:target'));
            }
            actions = bdajax._defs_to_array(elem.attr('ajax:action'));
            for (var i = 0; i < actions.length; i++) {
                var defs = actions[i].split(':');
                bdajax.action({
                    name: defs[0],
                    selector: defs[1],
                    mode: defs[2],
                    url: target.url,
                    params: target.params
                });
            }
        },
        
        _defs_to_array: function(str) {
            // XXX: if space in selector when receiving def str, this will fail
            var arr;
            if (str.indexOf(' ') != -1) {
                arr = str.split(' ');
            } else {
                arr = new Array(str);
            }
            return arr;
        }
    };

})(jQuery);