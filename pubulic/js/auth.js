// auth.js - Authentication management
import { supabase } from "../config/supabase.js";

// Auth state
const authState = {
  user: null,
  loading: true,
};

// Check auth on page load
window.checkAuth = async () => {
  try {
    const { data } = await supabase.auth.getUser();
    authState.user = data.user;
    authState.loading = false;
    return data.user;
  } catch (error) {
    console.error("Auth check error:", error);
    authState.loading = false;
    return null;
  }
};

// Login function
window.login = async (email, password) => {
  try {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    authState.user = data.user;
    alert("✅ Logged in successfully!");
    return data.user;
  } catch (error) {
    console.error("Login error:", error);
    alert(`Login failed: ${error.message}`);
    return null;
  }
};

// Sign up function
window.signup = async (email, password, passwordConfirm, name = "") => {
  try {
    if (!email || !password || !passwordConfirm) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== passwordConfirm) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || email.split("@")[0] },
      },
    });

    if (error) throw error;
    alert("✅ Account created! Check your email to confirm.");
    authState.user = data.user;
    return data.user;
  } catch (error) {
    console.error("Signup error:", error);
    alert(`Signup failed: ${error.message}`);
    return null;
  }
};

// Logout function
window.logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    authState.user = null;
    alert("✅ Logged out successfully!");
    location.href = "/";
  } catch (error) {
    console.error("Logout error:", error);
    alert("Error logging out. Please try again.");
  }
};

// Google OAuth login (if configured)
window.loginWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  } catch (error) {
    console.error("Google login error:", error);
    alert("Google login not configured. Please use email/password.");
  }
};

// GitHub OAuth login (if configured)
window.loginWithGithub = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  } catch (error) {
    console.error("GitHub login error:", error);
    alert("GitHub login not configured. Please use email/password.");
  }
};

// Password reset
window.resetPassword = async (email) => {
  try {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    });

    if (error) throw error;
    alert("✅ Check your email for password reset link!");
  } catch (error) {
    console.error("Reset password error:", error);
    alert(`Error: ${error.message}`);
  }
};

// Update password
window.updatePassword = async (newPassword, confirmPassword) => {
  try {
    if (!newPassword || !confirmPassword) {
      alert("Please fill in password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    alert("✅ Password updated successfully!");
  } catch (error) {
    console.error("Update password error:", error);
    alert(`Error: ${error.message}`);
  }
};

// Get current user
window.getCurrentUser = () => {
  return authState.user;
};

// Check if user is authenticated
window.isAuthenticated = () => {
  return !!authState.user;
};

// Protect routes
window.requireAuth = async () => {
  const user = await checkAuth();
  if (!user) {
    alert("Please login to continue");
    location.href = "/auth/login.html";
  }
  return user;
};

// Auto-check auth on load
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
  
  // Update UI based on auth state
  const authNav = document.getElementById("authNav");
  if (authNav) {
    if (authState.user) {
      authNav.innerHTML = `
        <span>Welcome, ${authState.user.email}</span>
        <button onclick="logout()">Logout</button>
      `;
    } else {
      authNav.innerHTML = `
        <a href="/auth/login.html">Login</a>
        <a href="/auth/signup.html">Sign Up</a>
      `;
    }
  }
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  authState.user = session?.user || null;
  console.log("Auth state changed:", event);
});
