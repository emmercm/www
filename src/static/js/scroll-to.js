function scrollToCenter(selector) {
    var $elem = $(selector);
    window.scroll({
        top: $elem.offset().top - ($(window).height() - $elem.height()) / 2,
        behavior: 'smooth'
    });
}
