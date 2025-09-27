document.addEventListener('DOMContentLoaded', () => {
    const openDrawer = document.getElementById('openDrawer');
    const drawer = document.getElementById('drawer');
    const closeDrawer = document.getElementById('closeDrawer');

    if (openDrawer && drawer && closeDrawer) {
        function checkMobile() {
            if (window.innerWidth <= 980) {
                openDrawer.style.display = 'flex';
            } else {
                openDrawer.style.display = 'none';
                drawer.setAttribute('aria-hidden', 'true');
            }
        }

        window.addEventListener('resize', checkMobile);
        checkMobile();

        openDrawer.addEventListener('click', () => {
            drawer.setAttribute('aria-hidden', 'false');
        });

        closeDrawer.addEventListener('click', () => {
            drawer.setAttribute('aria-hidden', 'true');
        });
    }
});
