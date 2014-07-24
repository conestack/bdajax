/*
 * bdajax_bs3 v1.6.0
 *
 * Author: Robert Niederreiter
 * License: GPL
 *
 * Additional script if bootstrap 3 is used for adopting overlay behavior.
 */

(function($) {

    $.tools.overlay.addEffect('bs3',
        function(pos, onLoad) {
            $('body', document).css('padding-right', '13px')
                               .addClass('modal-open');
            var overlay = this.getOverlay();
            overlay.css('overflow-y', 'scroll')
                   .css('position', 'fixed')
                   .css('top', '0');
            overlay.fadeIn(300, onLoad);
        }, function(onClose) {
            if ($('.modal:visible').length == 1) {
                $('body', document).css('padding-right', '')
                                   .removeClass('modal-open');
            }
            var overlay = this.getOverlay();
            overlay.fadeOut(300, onClose);
        }
    );

    $.tools.overlay.conf.effect = 'bs3';

})(jQuery);
