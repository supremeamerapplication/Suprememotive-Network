// read-more.js - Read more modal functionality

// Post content details
const postDetails = {
  1: {
    title: "Success starts with Discipline",
    fullContent: `Discipline is the bridge between dreams and achievement. Build habits that move you forward every day.

Discipline isn't about punishment or restriction. It's about the ability to do what needs to be done, when it needs to be done, regardless of how you feel.

The difference between successful people and everyone else is not talent, luck, or opportunity. It's discipline. It's the ability to consistently show up, day after day, even when motivation wanes.

Here are the keys to building unbreakable discipline:

1. Start Small - Don't overhaul your life overnight. Build one habit at a time.
2. Make it Easy - Design your environment to support good habits.
3. Track Progress - What gets measured gets managed.
4. Find Your Why - Connect to a deeper purpose beyond the task.
5. Practice Consistently - Discipline is built through repetition.

Remember: Discipline is a muscle. The more you use it, the stronger it becomes.`
  },
  2: {
    title: "Consistency Beats Talent",
    fullContent: `Small daily actions repeated over time create extraordinary results.

You don't need to be the most talented person in the room to succeed. What you need is consistency. The ability to show up, day after day, and do the work even when it's not glamorous.

Many talented people never achieve their full potential because they lack consistency. They have bursts of motivation followed by periods of inactivity. This inconsistency prevents compounding.

The magic of consistency:
- Compound interest applies to skills and habits too
- Small daily improvements lead to massive yearly gains
- Consistency builds credibility and trust
- It separates amateurs from professionals

The 1% rule: If you improve just 1% every day, you'll be 37x better in a year.

Start today. Be consistent. Let time and compounding work their magic.`
  },
  3: {
    title: "Mind Over Matter",
    fullContent: `Your mind is your greatest asset. Master your thoughts, master your life. Learn the power of mental resilience.

Every limitation you face starts in your mind. Every obstacle is first a mental obstacle. Change your mind, and you change your reality.

Mental resilience is the ability to:
- Bounce back from failure quickly
- Stay calm under pressure
- Maintain focus on long-term goals
- Believe in yourself even when others don't
- Transform challenges into opportunities

The practices of mental mastery:
1. Meditation - Train your attention
2. Visualization - See success before it happens
3. Affirmations - Reprogram your belief system
4. Journaling - Process emotions and gain clarity
5. Reading - Expand your perspective

Your mind is infinitely powerful. Use it wisely.`
  }
};

// Open read more modal
window.openReadMore = (postIndex) => {
  const post = postDetails[postIndex] || postDetails[1];
  
  // Create modal if it doesn't exist
  let modal = document.getElementById("readMoreModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "readMoreModal";
    modal.className = "modal";
    document.body.appendChild(modal);
    
    // Add modal styles
    const style = document.createElement("style");
    style.textContent = `
      .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        animation: fadeIn 0.3s;
      }

      .modal.active {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .modal-content {
        background: var(--secondary);
        padding: 2rem;
        border-radius: 1.5rem;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        border-bottom: 2px solid var(--highlight);
        padding-bottom: 1rem;
      }

      .modal-header h2 {
        margin: 0;
        color: var(--highlight);
        font-size: 1.8rem;
      }

      .close-btn {
        background: var(--accent);
        color: var(--text);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .close-btn:hover {
        background: var(--highlight);
      }

      .modal-body {
        color: var(--text);
        line-height: 1.8;
        font-size: 1rem;
      }

      .modal-body p {
        margin-bottom: 1rem;
        text-align: justify;
      }

      .modal-footer {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 2px solid var(--accent);
        display: flex;
        gap: 1rem;
        justify-content: center;
      }

      .modal-footer button {
        padding: 0.8rem 2rem;
        border: none;
        border-radius: 0.6rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-close {
        background: var(--accent);
        color: var(--text);
      }

      .btn-close:hover {
        background: var(--highlight);
        transform: translateY(-2px);
      }

      .btn-share {
        background: var(--highlight);
        color: var(--primary);
      }

      .btn-share:hover {
        background: var(--accent);
        color: var(--text);
        transform: translateY(-2px);
      }

      @media (max-width: 768px) {
        .modal-content {
          width: 95%;
          padding: 1.5rem;
          max-height: 95vh;
        }

        .modal-header h2 {
          font-size: 1.4rem;
        }

        .modal-body {
          font-size: 0.95rem;
        }

        .modal-footer {
          flex-direction: column;
        }

        .modal-footer button {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Populate modal content
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${post.title}</h2>
        <button class="close-btn" onclick="closeReadMore()">&times;</button>
      </div>
      <div class="modal-body">
        ${post.fullContent.split('\n\n').map(p => `<p>${p}</p>`).join('')}
      </div>
      <div class="modal-footer">
        <button class="btn-share" onclick="sharePost()">↗️ Share This Article</button>
        <button class="btn-close" onclick="closeReadMore()">Close</button>
      </div>
    </div>
  `;

  // Show modal
  modal.classList.add("active");

  // Close when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeReadMore();
    }
  });
};

// Close read more modal
window.closeReadMore = () => {
  const modal = document.getElementById("readMoreModal");
  if (modal) {
    modal.classList.remove("active");
  }
};

// Close modal with escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeReadMore();
  }
});

// Add click handlers to all read more buttons
document.addEventListener("DOMContentLoaded", () => {
  const readMoreButtons = document.querySelectorAll(".read-more-btn");
  readMoreButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      openReadMore(index + 1);
    });
  });
});
