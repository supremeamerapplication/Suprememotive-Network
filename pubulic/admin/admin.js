// admin.js - Admin dashboard functionality
import { supabase } from "../config/supabase.js";

// Admin state
const adminState = {
  user: null,
  isAdmin: false,
  stats: {
    totalPosts: 0,
    totalUsers: 0,
    totalLikes: 0,
    totalComments: 0,
  },
};

// Initialize admin dashboard
window.initAdmin = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      alert("Please login to access admin panel");
      location.href = "/";
      return;
    }

    adminState.user = user.user;

    // Check if user is admin (you can add role checking here)
    // For now, assume all authenticated users can access admin
    adminState.isAdmin = true;

    // Load dashboard data
    await loadDashboardStats();
    await loadAllPosts();
    await setupAdminFunctions();
  } catch (error) {
    console.error("Admin init error:", error);
    alert("Error initializing admin panel");
  }
};

// Load dashboard statistics
window.loadDashboardStats = async () => {
  try {
    // Get total posts
    const { count: postsCount } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    // Get total users (via posts)
    const { data: uniqueUsers } = await supabase
      .from("posts")
      .select("user_id", { count: "exact" })
      .distinct();

    // Get total likes
    const { count: likesCount } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true });

    // Get total comments
    const { count: commentsCount } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true });

    // Update state
    adminState.stats = {
      totalPosts: postsCount || 0,
      totalUsers: uniqueUsers?.length || 0,
      totalLikes: likesCount || 0,
      totalComments: commentsCount || 0,
    };

    // Update UI
    updateStatsDisplay();
  } catch (error) {
    console.error("Error loading stats:", error);
  }
};

// Update stats display
function updateStatsDisplay() {
  const statsContainer = document.getElementById("dashboardStats");
  if (!statsContainer) return;

  statsContainer.innerHTML = `
    <div class="stat-box">
      <h3>Total Posts</h3>
      <p class="stat-number">${adminState.stats.totalPosts}</p>
    </div>
    <div class="stat-box">
      <h3>Active Users</h3>
      <p class="stat-number">${adminState.stats.totalUsers}</p>
    </div>
    <div class="stat-box">
      <h3>Total Likes</h3>
      <p class="stat-number">${adminState.stats.totalLikes}</p>
    </div>
    <div class="stat-box">
      <h3>Total Comments</h3>
      <p class="stat-number">${adminState.stats.totalComments}</p>
    </div>
  `;
}

// Load all posts for admin
window.loadAllPosts = async () => {
  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("id, title, content, created_at, user_id, user:user_id(email)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const postsTable = document.getElementById("postsTable");
    if (!postsTable) return;

    if (!posts || posts.length === 0) {
      postsTable.innerHTML = "<tr><td colspan='5'>No posts found</td></tr>";
      return;
    }

    postsTable.innerHTML = posts
      .map(
        (post) => `
        <tr>
          <td>${post.title}</td>
          <td>${post.user?.email || "Unknown"}</td>
          <td>${new Date(post.created_at).toLocaleDateString()}</td>
          <td>${post.content.substring(0, 50)}...</td>
          <td>
            <button class="btn-small" onclick="editPostAdmin('${post.id}')">Edit</button>
            <button class="btn-small btn-danger" onclick="deletePostAdmin('${post.id}')">Delete</button>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error loading posts:", error);
  }
};

// Edit post (admin)
window.editPostAdmin = async (postId) => {
  try {
    const { data: post, error } = await supabase
      .from("posts")
      .select("title, content")
      .eq("id", postId)
      .single();

    if (error) throw error;

    const newTitle = prompt("Edit title:", post.title);
    if (!newTitle) return;

    const newContent = prompt("Edit content:", post.content);
    if (!newContent) return;

    const { error: updateError } = await supabase
      .from("posts")
      .update({ title: newTitle, content: newContent })
      .eq("id", postId);

    if (updateError) throw updateError;
    alert("✅ Post updated successfully!");
    await loadAllPosts();
  } catch (error) {
    console.error("Error editing post:", error);
    alert("Error editing post");
  }
};

// Delete post (admin)
window.deletePostAdmin = async (postId) => {
  if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) {
    return;
  }

  try {
    // Delete associated comments
    await supabase.from("comments").delete().eq("post_id", postId);

    // Delete associated likes
    await supabase.from("likes").delete().eq("post_id", postId);

    // Delete post
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) throw error;
    alert("✅ Post deleted successfully!");
    await loadAllPosts();
    await loadDashboardStats();
  } catch (error) {
    console.error("Error deleting post:", error);
    alert("Error deleting post");
  }
};

// Get users list
window.loadUsers = async () => {
  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("user_id, user:user_id(email, created_at)")
      .distinct();

    if (error) throw error;

    const usersTable = document.getElementById("usersTable");
    if (!usersTable) return;

    if (!posts || posts.length === 0) {
      usersTable.innerHTML = "<tr><td colspan='3'>No users found</td></tr>";
      return;
    }

    const uniqueUsers = {};
    posts.forEach((p) => {
      if (p.user && !uniqueUsers[p.user_id]) {
        uniqueUsers[p.user_id] = p.user;
      }
    });

    usersTable.innerHTML = Object.entries(uniqueUsers)
      .map(
        ([id, user]) => `
        <tr>
          <td>${user.email}</td>
          <td>${new Date(user.created_at).toLocaleDateString()}</td>
          <td>
            <button class="btn-small" onclick="viewUserPosts('${id}')">View Posts</button>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error loading users:", error);
  }
};

// View user's posts
window.viewUserPosts = async (userId) => {
  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("id, title, created_at")
      .eq("user_id", userId);

    if (error) throw error;

    const postList = posts.map((p) => `- ${p.title}`).join("\n");
    alert(`Posts by this user:\n\n${postList || "No posts"}`);
  } catch (error) {
    console.error("Error loading user posts:", error);
  }
};

// Export statistics
window.exportStats = () => {
  try {
    const data = {
      exportDate: new Date().toISOString(),
      stats: adminState.stats,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suprememotive-stats-${Date.now()}.json`;
    a.click();
    alert("✅ Statistics exported successfully!");
  } catch (error) {
    console.error("Error exporting stats:", error);
    alert("Error exporting statistics");
  }
};

// Setup tab switching
function setupAdminFunctions() {
  const tabs = document.querySelectorAll(".admin-tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      const tabName = e.target.getAttribute("data-tab");

      // Hide all tabs
      tabContents.forEach((content) => {
        content.style.display = "none";
      });

      // Remove active class
      tabs.forEach((t) => t.classList.remove("active"));

      // Show selected tab
      const activeContent = document.getElementById(tabName);
      if (activeContent) {
        activeContent.style.display = "block";
      }

      // Add active class
      e.target.classList.add("active");

      // Load data for selected tab
      if (tabName === "postsTab") {
        loadAllPosts();
      } else if (tabName === "usersTab") {
        loadUsers();
      }
    });
  });
}

// Logout admin
window.logoutAdmin = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    alert("✅ Logged out successfully!");
    location.href = "/";
  } catch (error) {
    console.error("Logout error:", error);
    alert("Error logging out");
  }
};

// Auto-initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("dashboardStats")) {
    initAdmin();
  }
});
