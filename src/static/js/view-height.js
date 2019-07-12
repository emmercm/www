/**
 * On mobile browsers the URL bar takes away from view height, so when it hides after scrolling the view height changes.
 * For elements with vh-* Bootstrap classes, fix its height to a set number on document load.
 *
 * https://stackoverflow.com/a/42965111/10317241
 */

$(document).ready(function () {
    $("[class^='vh-'], [class*=' vh-']").each(function () {
        var $elem = $(this).css('transition', 'none');

        var fix = function() {
            // Remove any previously set height, to re-calc height
            $elem.get(0).style.removeProperty('height');

            // Fix height to a specific amount
            $elem.get(0).style.setProperty('height', $elem.outerHeight() + 'px', 'important');
        };

        fix();
        $(window).resize(fix);
    })
});
