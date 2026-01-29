// ============================================
// THEME MANAGEMENT
// ============================================

const ThemeManager = {
    THEMES: {
        LIGHT: 'light',
        DARK: 'dark',
        AUTO: 'auto'
    },

    init: function() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            this.setTheme(this.THEMES.LIGHT);
        }
    },

    setTheme: function(theme) {
        localStorage.setItem('theme', theme);
        
        if (theme === this.THEMES.DARK) {
            document.body.classList.add('dark-mode');
            document.documentElement.style.colorScheme = 'dark';
        } else if (theme === this.THEMES.LIGHT) {
            document.body.classList.remove('dark-mode');
            document.documentElement.style.colorScheme = 'light';
        } else if (theme === this.THEMES.AUTO) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.classList.add('dark-mode');
                document.documentElement.style.colorScheme = 'dark';
            } else {
                document.body.classList.remove('dark-mode');
                document.documentElement.style.colorScheme = 'light';
            }
        }

        this.updateThemeColors();
    },

    toggleTheme: function() {
        const currentTheme = localStorage.getItem('theme') || this.THEMES.LIGHT;
        const newTheme = currentTheme === this.THEMES.LIGHT ? this.THEMES.DARK : this.THEMES.LIGHT;
        this.setTheme(newTheme);
    },

    getCurrentTheme: function() {
        return localStorage.getItem('theme') || this.THEMES.LIGHT;
    },

    updateThemeColors: function() {
        const isDark = document.body.classList.contains('dark-mode');
        const meta = document.querySelector('meta[name="theme-color"]');
        
        if (meta) {
            meta.setAttribute('content', isDark ? '#1a1a2e' : '#667eea');
        }
    },

    addThemeToggleButton: function() {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && !document.querySelector('.theme-toggle-btn')) {
            const themeBtn = document.createElement('button');
            themeBtn.className = 'theme-toggle-btn';
            themeBtn.innerHTML = this.getCurrentTheme() === this.THEMES.DARK ? '☀️' : '🌙';
            themeBtn.style.cssText = `
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1.2rem;
                transition: transform 0.3s ease;
            `;
            
            themeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
                themeBtn.innerHTML = this.getCurrentTheme() === this.THEMES.DARK ? '☀️' : '🌙';
            });
            
            themeBtn.addEventListener('hover', function() {
                this.style.transform = 'scale(1.1)';
            });
            
            navMenu.insertBefore(themeBtn, navMenu.lastChild);
        }
    }
};

// ============================================
// SYSTEM PREFERENCE LISTENER
// ============================================

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addListener((e) => {
    if (localStorage.getItem('theme') === ThemeManager.THEMES.AUTO) {
        ThemeManager.setTheme(ThemeManager.THEMES.AUTO);
    }
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    ThemeManager.addThemeToggleButton();
});
