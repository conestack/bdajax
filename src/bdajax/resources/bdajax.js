jQuery(document).ready(function() {
	jQuery('#ajax-spinner')
        .hide()
        .ajaxStart(function() {
            jQuery(this).show();
        })
        .ajaxStop(function() {
            jQuery(this).hide();
        })
    ;
	jQuery().bdajax();
});

jQuery.fn.bdajax = function() {
	jQuery('[ajax\\:bind]').each(function() {
		var ajax = jQuery(this);
		var events = ajax.attr('ajax:bind');
		if (ajax.attr('ajax:action')) {
            ajax.unbind(events).bind(events, bdajax.action);
        }
		if (ajax.attr('ajax:event')) {
            ajax.unbind(events).bind(events, bdajax.event);
        }
		if (ajax.attr('ajax:call')) {
            ajax.unbind(events).bind(events, bdajax.call);
        }
	});
}

bdajax = {
	
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
	
	parsetarget: function(elem) {
		var target = jQuery(elem).attr('ajax:target');
		var url = bdajax.parseurl(target);
		var params = bdajax.parsequery(target);
		if (!params) { params = {}; }
		return {
			url: url,
			params: params
		};
	},
	
    call: function(event) {
        event.preventDefault();
		var target = bdajax.parsetarget(this);
		var defs = bdajax._defs_to_array(jQuery(this).attr('ajax:call'));
        for (var i = 0; i < defs.length; i++) {
			var def = defs[i];
            def = def.split(':');
            func = eval(def[0]);
            func(jQuery(def[1]), target);
        }
    },
	
    event: function(event) {
		event.preventDefault();
        var target = bdajax.parsetarget(this);
		var defs = bdajax._defs_to_array(jQuery(this).attr('ajax:event'));
        for (var i = 0; i < defs.length; i++) {
			var def = defs[i];
            def = def.split(':');
            var evt = jQuery.Event(def[0]);
            evt.ajaxtarget = target;
            jQuery(def[1]).trigger(evt);
        }
    },
    
    action: function(event) {
		event.preventDefault();
		var target;
        if (event.target) {
            target = event.ajaxtarget;
        } else {
            target = bdajax.parsetarget(this);
        }
		actions = bdajax._defs_to_array(jQuery(this).attr('ajax:action'));
		for (var i = 0; i < actions.length; i++) {
			var defs = actions[i].split(':');
			bdajax._ajax({
	            name: defs[0],
	            selector: defs[1],
	            mode: defs[2],
	            url: target.url,
	            params: target.params,
	        });
		}
    },
	
    ajaxerrors: {
        timeout: 'The request has timed out. Pleasae try again.',
        error: 'An error occoured while processing the request. Aborting.',
        parsererror: 'The Response could not be parsed. Aborting.',
        unknown: 'An unknown error occoured while request. Aborting.'
    },
    
    ajaxerror: function(status) {
        if (status == 'notmodified') { return; }
        if (status == null) { status = 'unknown' }
        return bdajax.ajaxerrors[status];
    },
	
	// config.success: Callback if request is successful.
	// config.url: Request url as string.
	// config.params: Query parameters for request as Object (optional). 
	// config.type: ``xml``, ``json``, ``script``, or ``html`` (optional).
	// config.error: Callback if request fails (optional).
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
	
    // config.name: Action name
    // config.selector: result selector
	// config.mode: action mode
    // config.url: target url
    // config.params: query params
	_ajax: function(config) {
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
					jQuery().bdajax();
					// jQuery(selector).bdajax();
				} else if (mode == 'inner') {
					jQuery(selector).html(data.payload);
					jQuery(selector).each(function() {
						jQuery().bdajax();
						// jQuery(this).bdajax();
					});
				}
            },
            error: error
        });
	},
	
	_defs_to_array: function(str) {
        var arr;
		if (str.indexOf(' ') != -1) {
            arr = str.split(' ');
        } else {
            arr = new Array(str);
        }
        return arr
	}
};