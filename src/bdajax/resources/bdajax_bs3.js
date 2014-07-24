/*
 * bdajax_bs3 v1.6.0
 *
 * Author: Robert Niederreiter
 * License: GPL
 *
 * Additional script if bootstrap 3 is used for adopting overlay behavior.
 */

(function($) {

    // bs3 overlay effect
    $.tools.overlay.addEffect('bs3',
        function(pos, onLoad) {
            this.getOverlay().fadeIn(300);
        }, function(onClose) {
            this.getOverlay().fadeOut(300);
        }
    );

    $(document).ready(function() {
        $.tools.overlay.conf.top = 0;
        $.tools.overlay.conf.effect = 'bs3';

        $(document).bind('bdajax_overlay_before_load', function(event) {
            event.elem.css('overflow-y', 'scroll');
            event.elem.css('position', 'fixed');
            event.elem.css('top', '0');
            $('body', document)
                .css('padding-right', '13px')
                .addClass('modal-open');
        });

        $(document).bind('bdajax_overlay_close', function(event) {
            if (!$('.modal:visible').length) {
                $('body', document)
                    .css('padding-right', '')
                    .removeClass('modal-open');
            }
        });
    });

})(jQuery);
