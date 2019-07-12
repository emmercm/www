/**
 * On mobile browsers the URL bar takes away from view height, so when it hides after scrolling the view height changes.
 * For elements with vh-* Bootstrap classes, fix its height to a set number on document load.
 *
 * https://stackoverflow.com/a/42965111/10317241
 */

$(document).ready(function () {
    $("[class^='vh-'], [class*=' vh-']").each(function () {
        this.style.setProperty('height', $(this).outerHeight() + 'px', 'important');
    })
});
