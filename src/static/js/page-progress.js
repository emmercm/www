/**
 * Handle tags with data-page-progress attribute.
 */

$(document).ready(function () {
    $("[data-page-progress][data-page-progress!='']").each(function () {
        var $elem = $(this);
        var $progress = $('#' + $elem.attr('data-page-progress'));
        if (!$progress.is('.progress-bar')) {
            $progress = $progress.find('.progress-bar');
        }
        $progress.css('transition', 'none');

        var width = function () {
            // TODO: https://alligator.io/js/progress-bar-javascript-css-variables/ ?

            var zero = $elem.offset().top + parseInt($elem.css('padding-top'));
            // TODO: Not quite right, but good enough
            var hundred = $elem.offset().top + $elem.height() - $(window).height();

            var progress = ($(window).scrollTop() - zero) / hundred * 100;
            if (progress < 0) {
                progress = 0;
            } else if (progress > 100) {
                progress = 100;
            }
            $progress.get(0).style.setProperty('width', progress + '%', 'important');
        }

        width();
        $(window).scroll(width).resize(width);
    });
});
