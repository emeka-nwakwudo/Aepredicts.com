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

    const hamburgerButton = document.getElementById('hamburger-button');
    const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
    const mobileNavLinks = document.querySelector('.mobile-navlinks');

    if (hamburgerButton) {
        hamburgerButton.addEventListener('click', () => {
            const isOpened = mobileNavDrawer.getAttribute('aria-hidden') === 'false';
            mobileNavDrawer.setAttribute('aria-hidden', isOpened ? 'true' : 'false');
        });
    }

    if (mobileNavLinks) {
        mobileNavLinks.addEventListener('click', (event) => {
            if (event.target.tagName === 'A') {
                mobileNavDrawer.setAttribute('aria-hidden', 'true');
            }
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

    // --- Authentication related functions ---
    const signupLink = document.getElementById('signup-link');
    const logoutButton = document.getElementById('logout-button');
    const welcomeMessage = document.getElementById('welcome-message');

    let isAuthenticatedUser = false; // Flag to track authentication status

    async function checkAuthStatus() {
      try {
        const response = await fetch('/api/user'); // Call the new /api/user endpoint
        if (response.ok) {
          const data = await response.json();
          isAuthenticatedUser = true; // Set flag to true
          // User is logged in
          const signinLink = document.getElementById('signin-link');
          if (signupLink) signupLink.style.display = 'none';
          if (signinLink) signinLink.style.display = 'none';

          // Only show welcome message and logout button on the home page
          if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
            if (logoutButton) logoutButton.style.display = 'block';
            if (welcomeMessage) {
              welcomeMessage.textContent = `Welcome, ${data.username}!`; // Use username from response
              welcomeMessage.style.display = 'inline';
            }
          } else {
            if (logoutButton) logoutButton.style.display = 'none';
            if (welcomeMessage) welcomeMessage.style.display = 'none';
          }

          // Show admin link if user is an admin
          if (data.role === 'admin') {
            const adminLink = document.getElementById('admin-link');
            if (adminLink) {
              adminLink.style.display = 'block';
            }
            const adminLinkMobile = document.getElementById('admin-link-mobile');
            if (adminLinkMobile) {
              adminLinkMobile.style.display = 'block';
            }
          }

          const promoCard = document.querySelector('.promo');
          if (promoCard) promoCard.style.display = 'none';        } else {
          isAuthenticatedUser = false; // Set flag to false
          // User is not logged in
          if (signupLink) signupLink.style.display = 'block';
          if (logoutButton) logoutButton.style.display = 'none';
          if (welcomeMessage) welcomeMessage.style.display = 'none';
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        isAuthenticatedUser = false; // Assume not logged in on error
        // Assume not logged in on error
        if (signupLink) signupLink.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'none';
        if (welcomeMessage) welcomeMessage.style.display = 'none';
      } finally {
        // Make the auth controls visible after the check is complete
        const authControls = document.getElementById('auth-controls');
        if (authControls) {
          authControls.style.visibility = 'visible';
        }
      }
    }

    async function handleLogout() {
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
        });

        if (response.ok) {
          // Successfully logged out
          window.location.href = 'index.html'; // Redirect to home or login page
        } else {
          console.error('Logout failed:', await response.text());
          alert('Logout failed. Please try again.');
        }
      } catch (error) {
        console.error('Error during logout:', error);
        alert('An unexpected error occurred during logout.');
      }
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', handleLogout);
    }

    // Call checkAuthStatus on page load
    checkAuthStatus().then(() => {
      // --- Client-side route protection ---
      const protectedRoutes = ['/live.html', '/predictions.html', '/history.html'];
      const currentPath = window.location.pathname;

      if (protectedRoutes.includes(currentPath) && !isAuthenticatedUser) {
        window.location.href = 'signin.html'; // Redirect to sign-in page
      }
    });
});