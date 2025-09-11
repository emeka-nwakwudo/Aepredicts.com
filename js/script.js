document.addEventListener('DOMContentLoaded', () => {
    // Mobile drawer
    const openDrawer = document.getElementById('openDrawer');
    const drawer = document.getElementById('drawer');
    const closeDrawer = document.getElementById('closeDrawer');

    function checkMobile() {
        if (!openDrawer) return; // Ensure openDrawer exists before proceeding
        if (window.innerWidth <= 980) {
            openDrawer.style.display = '';
        } else {
            openDrawer.style.display = 'none';
            drawer.setAttribute('aria-hidden', 'true');
        }
    }
    window.addEventListener('resize', checkMobile);
    checkMobile();

    if (openDrawer) {
        openDrawer.addEventListener('click', () => {
            drawer.setAttribute('aria-hidden', 'false');
        });
    }
    if (closeDrawer) {
        closeDrawer.addEventListener('click', () => {
            drawer.setAttribute('aria-hidden', 'true');
        });
    }
});