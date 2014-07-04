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
        var prepare_modal = function(selector) {
            $('selector').bind('resize', function(event) {
                alert('resize');
            });
        }
        prepare_modal('#ajax-message');
        prepare_modal('#ajax-dialog');
        prepare_modal('#ajax-form');
        prepare_modal('#ajax-overlay');
    });

})(jQuery);
