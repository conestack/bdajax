/*
 * bdajax_bs3 v1.6.0
 *
 * Author: Robert Niederreiter
 * License: GPL
 *
 * Additional script if bootstrap 3 is used for adopting overlay behavior.
 */

(function($) {

    $(document).ready(function() {
        $.tools.overlay.conf.top = 0;
        $.tools.overlay.conf.fixed = true;
        $(document).bind('bdajax_overlay_before_load', function(event) {
            event.elem.css('overflow-y', 'scroll');
            $('body', document)
                .css('padding-right', '13px')
                .addClass('modal-open');
        });
        $(document).bind('bdajax_overlay_load', function(event) {
            event.elem.css('position', 'fixed');
            event.elem.css('top', '0');
        });
        $(document).bind('bdajax_overlay_close', function(event) {
            console.log($('.modal:visible').length);
            if (!$('.modal:visible').length) {
                $('body', document)
                    .css('padding-right', '')
                    .removeClass('modal-open');
            }
        });
    });

})(jQuery);
