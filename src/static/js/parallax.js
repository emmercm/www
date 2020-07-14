/**
 * Handle tags with data-parallax-* attributes.
 */

$(document).ready(function () {
    $("[data-parallax][data-parallax!='']").each(function () {
        var $elem = $(this);
        $elem.get(0).style.setProperty('transition', 'none', 'important');
        var velocity = parseFloat($elem.attr('data-parallax-velocity') || 1.0);

        if ($elem.attr('data-parallax') === 'scroll') {
            var position = function () {
                var viewportMiddle = $(window).scrollTop() + $(window).height() / 2;
                var documentMiddle = $(document).height() / 2;
                var backgroundPositionY = 50 + (viewportMiddle - documentMiddle) / 10 * velocity;
                if (backgroundPositionY < 0) {
                    backgroundPositionY = 0;
                } else if (backgroundPositionY > 100) {
                    backgroundPositionY = 100;
                }

                $elem.get(0).style.setProperty('background-position-y', backgroundPositionY + '%', 'important');
            };

            position();
            $(window).scroll(position).resize(position);
        }
    });
});
