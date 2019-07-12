/**
 * On mobile browsers the URL bar takes away from view height, so when it hides after scrolling the view height changes.
 * For elements with vh-* Bootstrap classes, fix its height to a set number on document load.
 */

$(document).ready(function () {
    $("[class^='vh-'], [class*=' vh-']").each(function () {
        // https://stackoverflow.com/a/42965111/10317241
        console.log(this);
        $(this).css('height', $(this).outerHeight());
    })
});
