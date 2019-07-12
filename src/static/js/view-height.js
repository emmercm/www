$(document).ready(function () {
    $("[class^='vh-'], [class*=' vh-']").each(function () {
        // https://stackoverflow.com/a/42965111/10317241
        console.log(this);
        $(this).css('height', $(this).outerHeight());
    })
});
