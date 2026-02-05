import { supabase } from "../config/supabase.js";

window.likePost = async (postId) => {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      alert("Please login to like posts");
      return;
    }

    const userId = data.user.id;

    // Check if user already liked this post
    const { data: existing, error: checkError } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existing) {
      // Unlike if already liked
      await supabase
        .from("likes")
        .delete()
        .eq("id", existing.id);
      alert("❤️ Unliked");
    } else {
      // Like the post
      await supabase
        .from("likes")
        .insert([{ post_id: postId, user_id: userId }]);
      alert("❤️ Liked!");
    }

    await updateLikeCount(postId);
  } catch (error) {
    console.error("Error liking post:", error);
    alert("Error processing like. Please try again.");
  }
};

window.updateLikeCount = async (postId) => {
  try {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact" })
      .eq("post_id", postId);

    const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
    if (likeBtn) {
      likeBtn.textContent = `❤️ ${count || 0}k`;
    }
  } catch (error) {
    console.error("Error updating like count:", error);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const postCards = document.querySelectorAll(".post");
  postCards.forEach(async (card) => {
    const postId = card.getAttribute("data-post-id");
    if (postId) {
      await updateLikeCount(postId);
    }
  });
});
