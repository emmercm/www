/**
 * On mobile browsers the URL bar takes away from view height, so when it hides after scrolling the view height changes.
 * Set the --vh CSS variable on page load and window resize.
 *
 * https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
 * http://bencentra.com/code/2015/02/27/optimizing-window-resize.html
 */

var viewHeightOrientation = undefined;
function viewHeight() {
    // Replicate deprecated window.orientationchange() behavior
    var newOrientation = $(window).height() > $(window).width() ? 'portrait' : 'landscape';
    if (newOrientation !== viewHeightOrientation) {
        document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
        viewHeightOrientation = newOrientation;
    }
}
viewHeight();

var timeout = false;
window.addEventListener('resize', function() {
    clearTimeout(timeout);
    timeout = setTimeout(viewHeight, 250);
});
