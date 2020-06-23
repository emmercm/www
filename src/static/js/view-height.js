/**
 * On mobile browsers the URL bar takes away from view height, so when it hides after scrolling the view height changes.
 * Set the --vh CSS variable on page load and window resize.
 *
 * https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
 * http://bencentra.com/code/2015/02/27/optimizing-window-resize.html
 */

function viewHeight() {
    document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
}
viewHeight();

var timeout = false;
window.addEventListener('resize', function() {
    clearTimeout(timeout);
    timeout = setTimeout(viewHeight, 250)
});
