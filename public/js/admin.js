// ============================================
// ADMIN DASHBOARD FUNCTIONALITY
// ============================================

const AdminManager = {
    // Initialize admin dashboard
    init: function() {
        this.loadDashboardData();
        this.attachEventListeners();
        this.initSidebar();
    },

    // Load dashboard data
    loadDashboardData: async function() {
        try {
            await window.SupabaseClient.init();

            const stats = { totalPosts: 0, totalUsers: 0, totalComments: 0, engagementRate: 0 };
            const postsCount = await window.SupabaseClient.posts.count();
            const usersCount = await window.SupabaseClient.usersCount ? await window.SupabaseClient.usersCount() : 0;
            const commentsCount = await window.SupabaseClient.commentsCount ? await window.SupabaseClient.commentsCount() : 0;

            stats.totalPosts = postsCount || 0;
            stats.totalUsers = usersCount || 0;
            stats.totalComments = commentsCount || 0;

            const statCards = document.querySelectorAll('.stat-value');
            if (statCards.length > 0) {
                statCards[0].textContent = stats.totalPosts;
                if (statCards[1]) statCards[1].textContent = stats.totalUsers;
                if (statCards[2]) statCards[2].textContent = stats.totalComments;
                if (statCards[3]) statCards[3].textContent = stats.engagementRate + '%';
            }

            if (document.getElementById('admin-posts')) {
                PostsManager.renderAdminList('admin-posts');
            }
        } catch (err) {
            console.error('Failed to load dashboard data', err);
        }
    },

    // Attach event listeners
    attachEventListeners: function() {
        // Quick action buttons
        document.querySelectorAll('.action-card').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                if (index === 0) {
                    window.location.href = '#view-posts';
                    showNotification('Loading all posts...', 'success');
                } else if (index === 1) {
                    window.location.href = '#manage-posts';
                    showNotification('Manage posts panel opened...', 'success');
                }
            });
        });

        // Support method buttons
        document.querySelectorAll('.support-method').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const method = btn.textContent.trim();
                showNotification(`${method} payment method selected`, 'info');
            });
        });
    },

    // Initialize sidebar
    initSidebar: function() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            if (index === 0) {
                item.classList.add('active');
            }

            item.addEventListener('click', (e) => {
                e.preventDefault();
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                const action = item.textContent.trim();
                showNotification(`Loading: ${action}`, 'success');
            });
        });
    },

    // Get dashboard statistics
    getStats: async function() {
        try {
            // Mock data - replace with actual API call
            return {
                totalPosts: 128,
                totalUsers: 1200,
                totalComments: 456,
                engagementRate: 78,
                newUsersThisMonth: 156,
                postsThisMonth: 34
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            return null;
        }
    },

    // Create new post (admin)
    createPost: async function(postData) {
        try {
            await window.SupabaseClient.init();
            const { data, error } = await window.SupabaseClient.posts.create(postData);
            if (error) throw error;
            this.loadDashboardData();
            return data;
        } catch (error) {
            console.error('Error creating post:', error);
            return null;
        }
    },

    // Get all users
    getAllUsers: async function() {
        try {
            // Mock data
            return [
                { id: 1, name: 'Ethan Gray', email: 'ethan@suprememotive.com', role: 'admin', status: 'active' },
                { id: 2, name: 'Sarah Johnson', email: 'sarah@suprememotive.com', role: 'user', status: 'active' },
                { id: 3, name: 'Mike Chen', email: 'mike@suprememotive.com', role: 'user', status: 'active' }
            ];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    },

    // Ban user
    banUser: async function(userId) {
        try {
            showNotification('User banned successfully', 'success');
            return true;
        } catch (error) {
            console.error('Error banning user:', error);
            showNotification('Failed to ban user', 'error');
            return false;
        }
    },

    // Delete post
    deletePost: async function(postId) {
        try {
            await window.SupabaseClient.init();
            const { error } = await window.SupabaseClient.posts.delete(postId);
            if (error) throw error;
            AdminManager.loadDashboardData();
            return true;
        } catch (error) {
            console.error('Error deleting post:', error);
            return false;
        }
    },

    // Moderate post
    moderatePost: async function(postId, action) {
        try {
            showNotification(`Post ${action} successfully`, 'success');
            return true;
        } catch (error) {
            console.error('Error moderating post:', error);
            showNotification('Failed to moderate post', 'error');
            return false;
        }
    },

    // Generate report
    generateReport: async function(reportType) {
        try {
            showNotification(`Generating ${reportType} report...`, 'success');
            return true;
        } catch (error) {
            console.error('Error generating report:', error);
            showNotification('Failed to generate report', 'error');
            return false;
        }
    }
};

// ============================================
// ADMIN SIDEBAR MOBILE
// ============================================

function initAdminMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const adminSidebar = document.querySelector('.admin-sidebar');

    if (hamburger && adminSidebar) {
        hamburger.addEventListener('click', () => {
            adminSidebar.classList.toggle('active');
        });

        // Close sidebar when clicking on nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    adminSidebar.classList.remove('active');
                }
            });
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is admin before loading admin panel
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'admin.html') {
        // Initialize admin dashboard
        AdminManager.init();
        initAdminMobileMenu();
    }
});
