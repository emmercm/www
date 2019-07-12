/**
 * On mobile browsers the URL bar takes away from view height, so when it hides after scrolling the view height changes.
 * For elements with vh-* Bootstrap classes, fix its height to a set number on document load.
 *
 * https://stackoverflow.com/a/42965111/10317241
 */

var md = new MobileDetect(window.navigator.userAgent);
if (md.mobile()) {
    $(document).ready(function () {
        $("[class^='vh-'], [class*=' vh-']").each(function () {
            var $elem = $(this).css('transition', 'none');

            var orientation = undefined;
            var fix = function () {
                // Replicate deprecated window.orientationchange() behavior
                var newOrientation = $(window).height() > $(window).width() ? 'portrait' : 'landscape';
                if (orientation !== newOrientation) {
                    // Remove any previously set height, to re-calc height
                    $elem.get(0).style.removeProperty('height');

                    // Fix height to a specific amount
                    $elem.get(0).style.setProperty('height', $elem.outerHeight() + 'px', 'important');
                }
                orientation = newOrientation;
            };

            fix();
            $(window).resize(fix);
        })
    });
}
