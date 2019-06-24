$(document).ready(function () {
    $("[data-opacity][data-opacity!='']").each(function () {
        var $elem = $(this);
        var property = $elem.attr('data-opacity-property') || 'opacity';
        var velocity = parseFloat($elem.attr('data-opacity-velocity') || 1.0);

        if ($elem.attr('data-opacity') === 'scroll') {
            var fade = function () {
                var opacity = $(window).scrollTop() * velocity;
                if (opacity < 0) {
                    opacity = 0;
                } else if (opacity > 100) {
                    opacity = 100;
                }
                opacity /= 100;

                if (property === 'background-color') {
                    // Get its current background color
                    var $dom = $elem;
                    var backgroundColor = 'transparent';
                    while (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
                        backgroundColor = $dom.css('background-color');
                        $dom = $dom.parent();
                    }

                    // Generate the new color
                    var backgroundColorParts = backgroundColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                    opacity = 'rgba(' + backgroundColorParts.slice(1).join(',') + ',' + opacity + ')';
                }

                $elem.get(0).style.setProperty(property, opacity, 'important');
            };

            fade();
            $(window).scroll(fade).resize(fade);
        }
    });
});
