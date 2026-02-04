import { supabase } from "../config/supabase.js";

window.initProfile = async () => {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      alert("Please login to view profile");
      location.href = "/";
      return;
    }

    // Display user info
    const emailEl = document.getElementById("email");
    const nameEl = document.getElementById("name");
    const avatarEl = document.getElementById("avatar");

    if (emailEl) emailEl.textContent = data.user.email;
    if (nameEl) nameEl.textContent = data.user.user_metadata?.name || "User";

    if (avatarEl) {
      avatarEl.textContent = (data.user.user_metadata?.name || data.user.email).charAt(0).toUpperCase();
    }

    // Load user's posts
    await loadUserPosts(data.user.id);

    // Setup logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to logout?")) {
          await supabase.auth.signOut();
          alert("Logged out successfully!");
          location.href = "/";
        }
      });
    }

    // Setup profile update
    const updateBtn = document.getElementById("updateProfileBtn");
    if (updateBtn) {
      updateBtn.addEventListener("click", async () => {
        const newName = prompt("Enter new name:");
        if (!newName) return;

        const { error } = await supabase.auth.updateUser({
          data: { name: newName },
        });

        if (error) throw error;
        alert("✅ Profile updated successfully!");
        location.reload();
      });
    }
  } catch (error) {
    console.error("Profile error:", error);
    alert("Error loading profile. Please try again.");
  }
};

window.loadUserPosts = async (userId) => {
  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("id, title, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const postsContainer = document.getElementById("userPosts");
    if (!postsContainer) return;

    if (!posts || posts.length === 0) {
      postsContainer.innerHTML = "<p>You haven't created any posts yet.</p>";
      return;
    }

    postsContainer.innerHTML = posts
      .map(
        (post) => `
        <div class="post-item">
          <h3>${post.title}</h3>
          <p>${post.content.substring(0, 100)}...</p>
          <small>${new Date(post.created_at).toLocaleDateString()}</small>
          <div class="post-actions">
            <button onclick="deletePost('${post.id}')">🗑️ Delete</button>
            <button onclick="editPost('${post.id}')">✏️ Edit</button>
          </div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error loading user posts:", error);
  }
};

window.editPost = async (postId) => {
  const newTitle = prompt("Enter new title:");
  if (!newTitle) return;

  const newContent = prompt("Enter new content:");
  if (!newContent) return;

  try {
    const { error } = await supabase
      .from("posts")
      .update({ title: newTitle, content: newContent })
      .eq("id", postId);

    if (error) throw error;
    alert("✅ Post updated successfully!");
    location.reload();
  } catch (error) {
    console.error("Error updating post:", error);
    alert("Error updating post. Please try again.");
  }
};

// Auto-initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("email")) {
    initProfile();
  }
});
