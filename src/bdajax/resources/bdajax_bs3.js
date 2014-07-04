/*
 * bdajax_bs3 v1.6.0
 *
 * Author: Robert Niederreiter
 * License: GPL
 *
 * Additional script if bootstrap 3 is used.
 */

(function($) {

    $(document).ready(function() {
        $(document).bind('bdajax_overlay_before_load', function(event) {
            var offset = $(event.elem).offset().top;
            event.overlay.getConf().top = offset * -1;
            var dialog = $('.modal-dialog', event.elem);
            dialog.css('top', offset);
        });
        $(document).bind('bdajax_overlay_load', function(event) {
            var dialog = $('.modal-dialog', event.elem);
            var dialog_offset = $(dialog).offset().top;
            var dialog_height = dialog.height();
            var document_height = $(document).height();
            if (dialog_offset + dialog_height > document_height) {
                event.elem.css('height', dialog_offset + dialog_height + 30);
            } else {
                event.elem.css('height', document_height);
            }
        });
    });

})(jQuery);
