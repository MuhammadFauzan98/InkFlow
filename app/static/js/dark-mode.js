// Dark mode functionality
const darkModeToggle = document.querySelector('#darkModeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Check for saved theme or prefer color scheme
function getThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    return prefersDarkScheme.matches ? 'dark' : 'light';
}

// Apply theme
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update toggle button text if exists (dropdown menu)
    const dropdownToggle = document.querySelector('.dropdown-item[onclick="toggleDarkMode()"]');
    if (dropdownToggle) {
        dropdownToggle.innerHTML = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }
    
    // Update theme icon if exists (hero section)
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Toggle dark mode
function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    
    // Show notification
    showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`);
}

// Initialize theme
document.addEventListener('DOMContentLoaded', () => {
    const theme = getThemePreference();
    applyTheme(theme);
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
});

// Add loading animation
const style = document.createElement('style');
style.textContent = `
.loading {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid var(--border-color);
    border-top: 2px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 8px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.tooltip {
    pointer-events: none;
}
`;
document.head.appendChild(style);