import { supabase } from "../config/supabase.js";

window.openComments = async (postId) => {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      alert("Please login to comment");
      return;
    }

    const text = prompt("Write your comment:");
    if (!text || text.trim() === "") {
      return;
    }

    const { error } = await supabase.from("comments").insert([
      {
        post_id: postId,
        user_id: data.user.id,
        text: text.trim(),
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    alert("✅ Comment added successfully!");
    await loadComments(postId);
  } catch (error) {
    console.error("Error posting comment:", error);
    alert("Error posting comment. Please try again.");
  }
};

window.loadComments = async (postId) => {
  try {
    const { data: comments, error } = await supabase
      .from("comments")
      .select("*, user:user_id(email, id)")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const commentsContainer = document.querySelector(
      `[data-post-id="${postId}"] .comments-list`
    );
    if (!commentsContainer) return;

    if (!comments || comments.length === 0) {
      commentsContainer.innerHTML = "<p>No comments yet. Be the first!</p>";
      return;
    }

    commentsContainer.innerHTML = comments
      .map(
        (comment) => `
        <div class="comment-item">
          <p class="comment-author">${comment.user?.email || "Anonymous"}</p>
          <p class="comment-text">${comment.text}</p>
          <small class="comment-time">${new Date(
            comment.created_at
          ).toLocaleDateString()}</small>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error loading comments:", error);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const postCards = document.querySelectorAll(".post");
  postCards.forEach(async (card) => {
    const postId = card.getAttribute("data-post-id");
    if (postId) {
      await loadComments(postId);
    }
  });
});
