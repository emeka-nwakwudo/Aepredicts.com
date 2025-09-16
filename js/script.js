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

    // Disclaimer Modal
    const modal = document.getElementById('disclaimer-modal');
    const closeButton = document.querySelector('.close-button');

    // Show the modal only if it hasn't been shown before in this session
    if (modal && !sessionStorage.getItem('disclaimerShown')) {
        modal.style.display = 'block';
    }

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            sessionStorage.setItem('disclaimerShown', 'true');
        }
    }

    // When the user clicks on <span> (x), close the modal
    if (closeButton) {
        closeButton.onclick = closeModal;
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }
});