/* jslint browser: true */
/* global jQuery */
/*
 * bdajax_bs3 v1.6.3
 *
 * Author: Robert Niederreiter
 * License: Simplified BSD
 *
 * Additional script if bootstrap 3 is used for adopting overlay behavior.
 */

(function($) {
    "use strict";

    $.tools.overlay.addEffect('bs3',
        function(pos, onLoad) {
            $('body').css('padding-right', '13px').addClass('modal-open');
            this.getOverlay().fadeIn(300, onLoad);
        }, function(onClose) {
            if ($('.modal:visible').length === 1) {
                $('body').css('padding-right', '').removeClass('modal-open');
            }
            this.getOverlay().fadeOut(300, onClose);
        }
    );

    $.tools.overlay.conf.effect = 'bs3';

})(jQuery);
