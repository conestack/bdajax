jQuery(document).ready(function() {
	var spinner = jQuery('#ajax-spinner');
	spinner.hide();
	spinner.ajaxStart(function() {
        jQuery(this).show();
    });
	spinner.ajaxStop(function() {
        jQuery(this).hide();
    });
	jQuery().bdajax(document);
});

jQuery.fn.bdajax = function(context) {
	jQuery('*', context).each(function() {
		for (var i in this.attributes) {
			var attr = this.attributes[i];
            if (attr && attr.nodeName) {
				var name = attr.nodeName;
                if (name.indexOf('ajax:bind') > -1) {
					var events = attr.nodeValue;
					var ajax = jQuery(this);
			        ajax.unbind(events);
			        if (ajax.attr('ajax:action')) {
			            ajax.bind(events, bdajax._action_handler);
			        }
			        if (ajax.attr('ajax:event')) {
			            ajax.bind(events, bdajax._event_handler);
			        }
			        if (ajax.attr('ajax:call')) {
			            ajax.bind(events, bdajax._call_handler);
			        }
					
                }
            }
        }
	});
	for (var binder in bdajax.binders) {
		bdajax.binders[binder](this);
	}
}

bdajax = {
	
	binders: {},
	
	ajaxerrors: {
        timeout: 'The request has timed out. Pleasae try again.',
        error: 'An error occoured while processing the request. Aborting.',
        parsererror: 'The Response could not be parsed. Aborting.',
        unknown: 'An unknown error occoured while request. Aborting.'
    },
    
    ajaxerror: function(status) {
        if (status == 'notmodified') { return; }
        if (status == null) { status = 'unknown'; }
        return bdajax.ajaxerrors[status];
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
			config.params = bdajax.parsequery(url);
			url = bdajax.parseurl(url);
			for (var key in addparams) {
                config.params[key] = addparams[key];
            }
		} else {
			if (!config.params) { config.params = {}; }
		}
		if (!config.type) { config.type = 'html'; }
	    if (!config.error) {
	        config.error = function(request, status) {
				var err = bdajax.ajaxerror(status);
				if (err) { bdajax.error(err); }
	        }
	    }
	    jQuery.ajax({
	        url: config.url,
	        dataType: config.type,
	        data: config.params,
	        success: config.success,
	        error: config.error
	    });
	},
	
	action: function(config) {
        config.params['bdajax.action'] = config.name;
		config.params['bdajax.mode'] = config.mode;
		config.params['bdajax.selector'] = config.selector;
		var error = function(req, status, exception) {
            bdajax.error(exception);
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
					jQuery(selector).replaceWith(data.payload);
					jQuery().bdajax(jQuery(selector).parent());
				} else if (mode == 'inner') {
					jQuery(selector).html(data.payload);
					jQuery().bdajax(jQuery(selector));
				}
            },
            error: error
        });
	},
	
	trigger: function(name, selector, target) {
        var evt = jQuery.Event(name);
        evt.ajaxtarget = bdajax.parsetarget(target);
        jQuery(selector).trigger(evt);
	},
	
	message: function(message) {
        jQuery('#ajax-message').overlay({
            expose: {
                color: '#fff',
                loadSpeed: 200
            },
            onBeforeLoad: function() {
                var overlay = this.getOverlay();
                jQuery('.message', overlay).html(message);
            },
            closeOnClick: false,
            api: true
        }).load();
    },
    
    error: function(message) {
        jQuery("#ajax-message .message").removeClass('error warning info')
                                        .addClass('error');
        bdajax.message(message);
    },
    
    info: function(message) {
        jQuery("#ajax-message .message").removeClass('error warning info')
                                        .addClass('info');
        bdajax.message(message);
    },
    
    warning: function(message) {
        jQuery("#ajax-message .message").removeClass('error warning info')
                                        .addClass('warning');
        bdajax.message(message);
    },
	
	_call_handler: function(event) {
        event.preventDefault();
        var elem = jQuery(this);
        var target = bdajax.parsetarget(elem.attr('ajax:target'));
        var defs = bdajax._defs_to_array(elem.attr('ajax:call'));
        for (var i = 0; i < defs.length; i++) {
            var def = defs[i];
            def = def.split(':');
            func = eval(def[0]);
            func(jQuery(def[1]), target);
        }
    },
    
    _event_handler: function(event) {
        event.preventDefault();
        var elem = jQuery(this);
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
        var elem = jQuery(this);
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
        var arr;
		if (str.indexOf(' ') != -1) {
            arr = str.split(' ');
        } else {
            arr = new Array(str);
        }
        return arr;
	}
};