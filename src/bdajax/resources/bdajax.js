/* jslint browser: true */
/* global jQuery, bdajax */
/*
 * bdajax v1.9.dev0
 *
 * Author: Robert Niederreiter
 * License: Simplified BSD
 *
 * Requires:
 * - jQuery 1.7+
 * - jQuery Tools overlay.js
 */

var bdajax;

(function($) {
    "use strict";

    $(document).ready(function() {
        bdajax.spinner.hide();
        bdajax.history.bind();
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
                        ajax.off(events);
                        if (ajax.attr('ajax:action') ||
                            ajax.attr('ajax:event')  ||
                            ajax.attr('ajax:overlay')) {
                            ajax.on(events, bdajax._dispatching_handler);
                        }
                    }
                    if (name.indexOf('ajax:form') > -1) {
                        bdajax.prepare_ajax_form($(this));
                    }
                }
            }
        });
        // B/C: Ajax forms have a dedicated ``ajax:form`` directive now.
        bdajax.bind_ajax_form(context);
        for (var binder in bdajax.binders) {
            try {
                bdajax.binders[binder](context);
            } catch(err) {
                console.log(err);
            }
        }
        return context;
    };

    // global bdajax object
    bdajax = {

        // By default, we redirect to the login page on 403 error.
        // That we assume at '/login'.
        default_403: '/login',

        // object for hooking up JS binding functions after ajax calls
        // B/C, use ``bdajax.register`` instead of direct extension
        binders: {},

        // function for registering bdajax binder functions
        register: function(func, instant) {
            var func_name = this._random_id();
            while (true) {
                if (this.binders[func_name] !== undefined) {
                    func_name = this._random_id();
                } else {
                    break;
                }
            }
            this.binders[func_name] = func;
            if (instant) {
                func();
            }
        },

        // ajax spinner handling
        spinner: {

            _elem: null,
            _request_count: 0,

            elem: function() {
                if (this._elem === null) {
                    this._elem = $('#ajax-spinner');
                }
                return this._elem;
            },

            show: function() {
                this._request_count++;
                if (this._request_count > 1) {
                    return;
                }
                this.elem().show();
            },

            hide: function(force) {
                this._request_count--;
                if (force) {
                    this._request_count = 0;
                    this.elem().hide();
                    return;
                } else if (this._request_count <= 0) {
                    this._request_count = 0;
                    this.elem().hide();
                }
            }
        },

        // browser history handling
        history: {

            bind: function() {
                $(window).on('popstate', this.handle);
            },

            handle: function(evt) {
                evt.preventDefault();
                var state = evt.originalEvent.state;
                if (!state) { return; }
                var target;
                if (state.target.url) {
                    target = state.target;
                } else {
                    target = bdajax.parsetarget(state.target);
                }
                target.params.popstate = '1';
                if (state.action) {
                    bdajax._handle_ajax_action(target, state.action);
                }
                if (state.event) {
                    bdajax._handle_ajax_event(target, state.event);
                }
                if (state.overlay) {
                    bdajax._handle_ajax_overlay(
                        target,
                        state.overlay,
                        state.overlay_css
                    );
                }
                if (!state.action && !state.event && !state.overlay) {
                    window.location = target.url;
                }
            }
        },

        parseurl: function(url) {
            var parser = document.createElement('a');
            parser.href = url;
            var path = parser.pathname;
            if (path.indexOf('/') !== 0) {
                // Internet Explorer 11 doesn't starts with '/'
                path = '/' + path;
            }
            url = parser.protocol + '//' + parser.host + path;
            if (url.charAt(url.length - 1) === '/') {
                url = url.substring(0, url.length - 1);
            }
            return url;
        },

        parsequery: function(url, as_string) {
            var parser = document.createElement('a');
            parser.href = url;
            var search = parser.search;
            if (as_string) {
                return search ? search : '';
            }
            var params = {};
            if (search) {
                var parameters = search.substring(1, search.length).split('&');
                for (var i = 0; i < parameters.length; i++) {
                    var param = parameters[i].split('=');
                    params[param[0]] = param[1];
                }
            }
            return params;
        },

        parsepath: function(url, include_query) {
            var parser = document.createElement('a');
            parser.href = url;
            if (include_query) {
                return parser.pathname + this.parsequery(url, true);
            }
            return parser.pathname;
        },

        parsetarget: function(target) {
            if (!target) {
                return {
                    url: undefined,
                    params: {},
                    path: undefined,
                    query: undefined
                };
            }
            var url = this.parseurl(target);
            var params = this.parsequery(target);
            var path = this.parsepath(target);
            var query = this.parsequery(target, true);
            if (!params) {
                params = {};
            }
            return {
                url: url,
                params: params,
                path: path,
                query: query
            };
        },

        request: function(options) {
            if (options.url.indexOf('?') !== -1) {
                var addparams = options.params;
                options.params = this.parsequery(options.url);
                options.url = this.parseurl(options.url);
                for (var key in addparams) {
                    options.params[key] = addparams[key];
                }
            } else {
                if (!options.params) { options.params = {}; }
            }
            if (!options.type) { options.type = 'html'; }
            if (!options.method) { options.method = 'GET'; }
            if (!options.error) {
                options.error = function(req, status, exception) {
                    if (parseInt(status, 10) === 403) {
                        window.location.hash = '';
                        window.location.pathname = bdajax.default_403;
                    } else {
                        var message = '<strong>' + status + '</strong> ';
                        message += exception;
                        bdajax.error(message);
                    }
                };
            }
            if (!options.cache) { options.cache = false; }
            var wrapped_success = function(data, status, request) {
                options.success(data, status, request);
                bdajax.spinner.hide();
            };
            var wrapped_error = function(request, status, error) {
                if (request.status === 0) {
                    bdajax.spinner.hide(true);
                    return;
                }
                status = request.status || status;
                error = request.statusText || error;
                options.error(request, status, error);
                bdajax.spinner.hide(true);
            };
            this.spinner.show();
            $.ajax({
                url: options.url,
                dataType: options.type,
                data: options.params,
                method: options.method,
                success: wrapped_success,
                error: wrapped_error,
                cache: options.cache
            });
        },

        path: function(options) {
            if (window.history.pushState === undefined) { return; }
            if (options.path.charAt(0) !== '/') {
                options.path = '/' + options.path;
            }
            if (!options.target) {
                options.target = window.location.origin + options.path;
            }
            var state = {
                target: options.target,
                action: options.action,
                event: options.event,
                overlay: options.overlay,
                overlay_css: options.overlay_css
            };
            if (options.replace) {
                window.history.replaceState(state, '', options.path);
            } else {
                window.history.pushState(state, '', options.path);
            }
        },

        action: function(options) {
            options.success = this._ajax_action_success;
            this._perform_ajax_action(options);
        },

        fiddle: function(payload, selector, mode) {
            if (mode === 'replace') {
                $(selector).replaceWith(payload);
                var context = $(selector);
                if (context.length) {
                    context.parent().bdajax();
                } else {
                    $(document).bdajax();
                }
            } else if (mode === 'inner') {
                $(selector).html(payload);
                $(selector).bdajax();
            }
        },

        continuation: function(definitions) {
            if (!definitions) { return; }
            this.spinner.hide();
            var definition, target;
            for (var idx in definitions) {
                definition = definitions[idx];
                if (definition.type === 'path') {
                    this.path({
                        path: definition.path,
                        target: definition.target,
                        action: definition.action,
                        event: definition.event,
                        overlay: definition.overlay,
                        overlay_css: definition.overlay_css
                    });
                } else if (definition.type === 'action') {
                    target = this.parsetarget(definition.target);
                    this.action({
                        url: target.url,
                        params: target.params,
                        name: definition.name,
                        mode: definition.mode,
                        selector: definition.selector
                    });
                } else if (definition.type === 'event') {
                    this.trigger(
                        definition.name,
                        definition.selector,
                        definition.target
                    );
                } else if (definition.type === 'overlay') {
                    target = this.parsetarget(definition.target);
                    this.overlay({
                        action: definition.action,
                        selector: definition.selector,
                        content_selector: definition.content_selector,
                        css: definition.css,
                        url: target.url,
                        params: target.params,
                        close: definition.close
                    });
                } else if (definition.type === 'message') {
                    if (definition.flavor) {
                        var flavors = ['message', 'info', 'warning', 'error'];
                        if (flavors.indexOf(definition.flavor) === -1) {
                            throw "Continuation definition.flavor unknown";
                        }
                        switch (definition.flavor) {
                            case 'message':
                                this.message(definition.payload);
                                break;
                            case 'info':
                                this.info(definition.payload);
                                break;
                            case 'warning':
                                this.warning(definition.payload);
                                break;
                            case 'error':
                                this.error(definition.payload);
                                break;
                        }
                    } else {
                        if (!definition.selector) {
                            throw "Continuation definition.selector expected";
                        }
                        $(definition.selector).html(definition.payload);
                    }
                }
            }
        },

        trigger: function(name, selector, target) {
            var create_event = function() {
                var evt = $.Event(name);
                if (target.url) {
                    evt.ajaxtarget = target;
                } else {
                    evt.ajaxtarget = bdajax.parsetarget(target);
                }
                return evt;
            };
            // _dispatching_handler calls stopPropagation on event which is
            // fine in order to prevent weird behavior on parent DOM elements,
            // especially for standard events. Since upgrade to jQuery 1.9
            // stopPropagation seem to react on the event instance instead of
            // the trigger call for each element returned by selector, at least
            // on custom events, thus we create a separate event instance for
            // each elem returned by selector.
            $(selector).each(function() {
                $(this).trigger(create_event());
            });
        },

        default_overlay_selector: '#ajax-overlay',
        default_overlay_content_selector: '.overlay_content',

        overlay: function(options) {
            var selector = this.default_overlay_selector;
            if (options.selector) {
                selector = options.selector;
            }
            if (options.close) {
                var elem = $(selector);
                var overlay = elem.data('overlay');
                if (overlay) {
                    overlay.close();
                }
                return;
            }
            var content_selector = this.default_overlay_content_selector;
            if (options.content_selector) {
                content_selector = options.content_selector;
            }
            var elem = $(selector);
            elem.removeData('overlay');
            var url, params;
            if (options.target) {
                var target = options.target;
                if (!target.url) {
                    target = this.parsetarget(target);
                }
                url = target.url;
                params = target.params;
            } else {
                url = options.url;
                params = options.params;
            }
            var css;
            if (options.css) {
                css = options.css;
            }
            var on_close = function() {
                var overlay = this.getOverlay();
                $(content_selector, overlay).html('');
                if (css) {
                    overlay.removeClass(css);
                }
                if (options.on_close) {
                    options.on_close();
                }
            };
            this._perform_ajax_action({
                name: options.action,
                selector: selector + ' ' + content_selector,
                mode: 'inner',
                url: url,
                params: params,
                success: function(data) {
                    bdajax._ajax_action_success(data);
                    // overlays are not displayed if no payload is received.
                    if (!data.payload) {
                        return;
                    }
                    if (css) {
                        elem.addClass(css);
                    }
                    elem.overlay({
                        mask: {
                            color: '#fff',
                            loadSpeed: 200
                        },
                        onClose: on_close,
                        oneInstance: false,
                        closeOnClick: true,
                        fixed: false
                    });
                    elem.data('overlay').load();
                }
            });
        },

        message: function(message) {
            var elem = $('#ajax-message');
            elem.removeData('overlay');
            elem.overlay({
                mask: {
                    color: '#fff',
                    loadSpeed: 200
                },
                onBeforeLoad: function() {
                    var overlay = this.getOverlay();
                    $('.message', overlay).html(message);
                },
                onLoad: function() {
                    elem.find('button:first').focus();
                },
                onBeforeClose: function() {
                    var overlay = this.getOverlay();
                    $('.message', overlay).empty();
                },
                oneInstance: false,
                closeOnClick: false,
                fixed: false,
                top:'20%'
            });
            elem.data('overlay').load();
        },

        error: function(message) {
            $("#ajax-message .message").removeClass('error warning info')
                                       .addClass('error');
            this.message(message);
        },

        info: function(message) {
            $("#ajax-message .message").removeClass('error warning info')
                                       .addClass('info');
            this.message(message);
        },

        warning: function(message) {
            $("#ajax-message .message").removeClass('error warning info')
                                       .addClass('warning');
            this.message(message);
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
                    $('button', overlay).off();
                    $('button.submit', overlay).on('click', function() {
                        closefunc();
                        callback(options);
                    });
                    $('button.cancel', overlay).on('click', function() {
                        closefunc();
                    });
                },
                oneInstance: false,
                closeOnClick: false,
                fixed: false,
                top:'20%'
            });
            elem.data('overlay').load();
        },

        // B/C: bind ajax form handling to all forms providing ajax css class
        bind_ajax_form: function(context) {
            bdajax.prepare_ajax_form($('form.ajax', context));
        },

        // prepare form desired to be an ajax form
        prepare_ajax_form: function(form) {
            if (!$('#ajaxformresponse').length) {
                $('body').append(
                    '<iframe ' +
                        'id="ajaxformresponse"' +
                        'name="ajaxformresponse"' +
                        'src="about:blank"' +
                        'style="width:0px;height:0px;display:none">' +
                    '</iframe>'
                );
            }
            form.append('<input type="hidden" name="ajax" value="1" />');
            form.attr('target', 'ajaxformresponse');
            form.off().on('submit', function(event) {
                bdajax.spinner.show();
            });
        },

        // called by iframe response
        render_ajax_form: function(payload, selector, mode, next) {
            $('#ajaxformresponse').remove();
            this.spinner.hide();
            if (payload) {
                this.fiddle(payload, selector, mode);
            }
            this.continuation(next);
        },

        _random_id: function(id_len) {
            if (!id_len) {
                id_len = 8;
            }
            var ret = '';
            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                        'abcdefghijklmnopqrstuvwxyz';
            for (var i = 0; i < id_len; i++) {
                ret += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return ret;
        },

        _dispatching_handler: function(event) {
            event.preventDefault();
            event.stopPropagation();
            var elem = $(this);
            var options = {
                elem: elem,
                event: event
            };
            if (elem.attr('ajax:confirm')) {
                options.message = elem.attr('ajax:confirm');
                bdajax.dialog(options, bdajax._do_dispatching);
            } else {
                bdajax._do_dispatching(options);
            }
        },

        _get_target: function(elem, event) {
            // return ajax target. lookup ``ajaxtarget`` on event, fall back to
            // ``ajax:target`` attribute on elem.
            if (event.ajaxtarget) {
                return event.ajaxtarget;
            }
            return this.parsetarget(elem.attr('ajax:target'));
        },

        _do_dispatching: function(options) {
            // use ``bdajax`` instead of ``this`` in this function. If called
            // as callback via ``bdajax.dialog``, ``this`` is undefined.
            var elem = options.elem;
            var event = options.event;
            if (elem.attr('ajax:action')) {
                bdajax._handle_ajax_action(
                    bdajax._get_target(elem, event),
                    elem.attr('ajax:action')
                );
            }
            if (elem.attr('ajax:event')) {
                bdajax._handle_ajax_event(
                    elem.attr('ajax:target'),
                    elem.attr('ajax:event')
                );
            }
            if (elem.attr('ajax:overlay')) {
                bdajax._handle_ajax_overlay(
                    bdajax._get_target(elem, event),
                    elem.attr('ajax:overlay'),
                    elem.attr('ajax:overlay-css')
                );
            }
            if (elem.attr('ajax:path')) {
                bdajax._handle_ajax_path(elem, event);
            }
        },

        _has_attr: function(elem, name) {
            var attr = elem.attr(name);
            return attr !== undefined && attr !== false;
        },

        _attr_value_or_fallback: function(elem, name, fallback) {
            if (this._has_attr(elem, name)) {
                return elem.attr(name);
            } else {
                return elem.attr(fallback);
            }
        },

        _handle_ajax_path: function(elem, evt) {
            var path = elem.attr('ajax:path');
            if (path === 'href') {
                var href = elem.attr('href');
                path = this.parsepath(href, true);
            } else if (path === 'target') {
                var tgt = this._get_target(elem, evt);
                path = tgt.path + tgt.query;
            }
            var target;
            if (this._has_attr(elem, 'ajax:path-target')) {
                target = elem.attr('ajax:path-target');
                if (target) {
                    target = this.parsetarget(target);
                }
            } else {
                target = this._get_target(elem, evt);
            }
            var action = this._attr_value_or_fallback(
                elem, 'ajax:path-action', 'ajax:action');
            var event = this._attr_value_or_fallback(
                elem, 'ajax:path-event', 'ajax:event');
            var overlay = this._attr_value_or_fallback(
                elem, 'ajax:path-overlay', 'ajax:overlay');
            var overlay_css = this._attr_value_or_fallback(
                elem, 'ajax:path-overlay-css', 'ajax:overlay-css');
            this.path({
                path: path,
                target: target,
                action: action,
                event: event,
                overlay: overlay,
                overlay_css: overlay_css
            });
        },

        _handle_ajax_event: function(target, event) {
            var defs = this._defs_to_array(event);
            for (var i = 0; i < defs.length; i++) {
                var def = defs[i];
                def = def.split(':');
                this.trigger(def[0], def[1], target);
            }
        },

        _ajax_action_success: function(data) {
            if (!data) {
                bdajax.error('Empty response');
                bdajax.spinner.hide();
            } else {
                bdajax.fiddle(data.payload, data.selector, data.mode);
                bdajax.continuation(data.continuation);
            }
        },

        _perform_ajax_action: function(options) {
            options.params['bdajax.action'] = options.name;
            options.params['bdajax.mode'] = options.mode;
            options.params['bdajax.selector'] = options.selector;
            this.request({
                url: bdajax.parseurl(options.url) + '/ajaxaction',
                type: 'json',
                params: options.params,
                success: options.success
            });
        },

        _handle_ajax_action: function(target, action) {
            var actions = this._defs_to_array(action);
            for (var i = 0; i < actions.length; i++) {
                var defs = actions[i].split(':');
                this.action({
                    name: defs[0],
                    selector: defs[1],
                    mode: defs[2],
                    url: target.url,
                    params: target.params
                });
            }
        },

        _handle_ajax_overlay: function(target, overlay, css) {
            if (overlay.indexOf('CLOSE') > -1) {
                var options = {};
                if (overlay.indexOf(':') > -1) {
                    options.selector = overlay.split(':')[1];
                }
                options.close = true;
                this.overlay(options);
                return;
            }
            if (overlay.indexOf(':') > -1) {
                var defs = overlay.split(':');
                var options = {
                    action: defs[0],
                    selector: defs[1],
                    url: target.url,
                    params: target.params,
                    css: css
                };
                if (defs.length === 3) {
                    options.content_selector = defs[2];
                }
                this.overlay(options);
                return;
            }
            this.overlay({
                action: overlay,
                url: target.url,
                params: target.params,
                css: css
            });
        },

        _defs_to_array: function(str) {
            // XXX: if space in selector when receiving def str, this will fail
            var arr = str.replace(/\s+/g, ' ').split(' ');
            return arr;
        }
    };

})(jQuery);
