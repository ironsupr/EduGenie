// Universal Navbar JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeNavbar();
});

function initializeNavbar() {
    const navbar = document.querySelector('.navbar');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    
    // Handle scroll effect
    handleNavbarScroll();
    
    // Handle mobile menu toggle
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            toggleMobileMenu();
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                closeMobileMenu();
            }
        });
    }
    
    // Handle user dropdown
    if (userMenuBtn && userDropdownMenu) {
        userMenuBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            toggleUserDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!userDropdownMenu.contains(event.target) && !userMenuBtn.contains(event.target)) {
                closeUserDropdown();
            }
        });
    }
    
    // Handle navbar links active state
    setActiveNavLink();
}

function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class when scrolling down
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    
    if (!mobileMenu || !mobileMenuToggle) return;
    
    const isOpen = mobileMenu.classList.contains('show');
    
    if (isOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    
    if (!mobileMenu || !mobileMenuToggle) return;
    
    mobileMenu.classList.add('show');
    mobileMenuToggle.querySelector('i').classList.remove('fa-bars');
    mobileMenuToggle.querySelector('i').classList.add('fa-times');
    
    // Prevent body scroll when mobile menu is open
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    
    if (!mobileMenu || !mobileMenuToggle) return;
    
    mobileMenu.classList.remove('show');
    mobileMenuToggle.querySelector('i').classList.remove('fa-times');
    mobileMenuToggle.querySelector('i').classList.add('fa-bars');
    
    // Restore body scroll
    document.body.style.overflow = '';
}

function toggleUserDropdown() {
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    if (!userDropdownMenu) return;
    
    const isOpen = userDropdownMenu.classList.contains('show');
    
    if (isOpen) {
        closeUserDropdown();
    } else {
        openUserDropdown();
    }
}

function openUserDropdown() {
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    if (!userDropdownMenu) return;
    
    userDropdownMenu.classList.add('show');
}

function closeUserDropdown() {
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    if (!userDropdownMenu) return;
    
    userDropdownMenu.classList.remove('show');
}

function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Remove existing active classes
        link.classList.remove('active');
        
        // Add active class to matching links
        if (href === currentPath || 
            (currentPath === '/' && href === '/') ||
            (currentPath.startsWith('/courses') && href === '/courses') ||
            (currentPath.startsWith('/university-exam') && href === '/university-exam') ||
            (currentPath.startsWith('/study') && href === '/study')) {
            link.classList.add('active');
        }
    });
}

// Smooth scroll for anchor links
function initializeSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                event.preventDefault();
                
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 70;
                const targetPosition = target.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    initializeSmoothScroll();
    
    // Handle form submissions in dropdowns
    const logoutForms = document.querySelectorAll('form[action="/api/logout"]');
    logoutForms.forEach(form => {
        form.addEventListener('submit', function(event) {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing out...';
                submitBtn.disabled = true;
                
                // Re-enable after a delay in case of error
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 5000);
            }
        });
    });
});

// Export functions for use in other scripts
window.NavbarUtils = {
    toggleMobileMenu,
    closeMobileMenu,
    openMobileMenu,
    toggleUserDropdown,
    closeUserDropdown,
    openUserDropdown,
    setActiveNavLink
};
