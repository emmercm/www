/**
 * Handle tags with data-parallax attribute.
 */

$(document).ready(function () {
    $("[data-parallax][data-parallax!='']").each(function () {
        var $elem = $(this);
        $elem.get(0).style.setProperty('transition', 'none', 'important');

        if ($elem.attr('data-parallax') === 'scroll') {
            var position = function () {
                var hundred = Math.max($(document).height(), $(window).height() * 4) - $(window).height();

                var backgroundPositionY = $(window).scrollTop() / hundred * 100;
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
