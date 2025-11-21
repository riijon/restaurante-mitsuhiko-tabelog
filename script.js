// API endpoint
const API_ENDPOINT = "/api/reviews";

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadReviews();
  initializeReviewForm();
  initializeTabNavigation();
});

// Tab Navigation
function initializeTabNavigation() {
  const tabLinks = document.querySelectorAll(".tab-link");

  tabLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      tabLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const targetId = link.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// Load reviews from API
async function loadReviews() {
  const reviewsList = document.getElementById("reviewsList");

  try {
    const response = await fetch(API_ENDPOINT);

    if (!response.ok) {
      throw new Error("Failed to load reviews");
    }

    const data = await response.json();
    const reviews = data.reviews || [];

    // Update average rating
    updateRating(reviews);

    // Display reviews
    if (reviews.length === 0) {
      reviewsList.innerHTML =
        '<div class="loading">まだ口コミがありません。最初の口コミを投稿してみませんか？</div>';
    } else {
      reviewsList.innerHTML = reviews
        .map((review) => createReviewHTML(review))
        .join("");
    }
  } catch (error) {
    console.error("Error loading reviews:", error);
    reviewsList.innerHTML =
      '<div class="loading">口コミの読み込みに失敗しました。ページを再読み込みしてください。</div>';
  }
}

// Create review HTML - Tabelog style
function createReviewHTML(review) {
  const visitDate = review.visit_date
    ? new Date(review.visit_date).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const createdDate = new Date(review.created_at).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stars = Array(5)
    .fill(0)
    .map((_, i) => {
      return `<span class="star ${i < review.rating ? "filled" : ""}">★</span>`;
    })
    .join("");

  return `
        <div class="review-item">
            <div class="review-header-flex">
                <div class="reviewer-info">
                    <div class="reviewer-name">${escapeHtml(
                      review.reviewer_name
                    )}</div>
                    <div class="review-date">投稿: ${createdDate}</div>
                </div>
                <div class="review-content">
                    <div class="review-rating-stars">${stars}</div>
                    ${
                      visitDate
                        ? `<div class="visit-date-badge">訪問: ${visitDate}</div>`
                        : ""
                    }
                    <div class="review-text">${escapeHtml(review.comment)}</div>
                </div>
            </div>
        </div>
    `;
}

// Update rating display
function updateRating(reviews) {
  const reviewCount = document.getElementById("reviewCount");
  const avgRatingDisplay = document.getElementById("avgRating");
  const avgStars = document.getElementById("avgStars");

  reviewCount.textContent = reviews.length;

  if (reviews.length > 0) {
    const average =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const roundedAverage = Math.round(average * 10) / 10;

    avgRatingDisplay.textContent = roundedAverage.toFixed(2);

    // Update stars
    const fullStars = Math.floor(roundedAverage);
    avgStars.innerHTML = Array(5)
      .fill(0)
      .map((_, i) => {
        return `<span class="star ${i < fullStars ? "filled" : ""}">★</span>`;
      })
      .join("");
  }
}

// Initialize review form
function initializeReviewForm() {
  const form = document.getElementById("reviewForm");
  const ratingInput = document.getElementById("ratingInput");
  const ratingValue = document.getElementById("rating");
  const commentInput = document.getElementById("comment");
  const charCount = document.getElementById("charCount");

  // Star rating
  const stars = ratingInput.querySelectorAll(".star-input");
  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      const rating = index + 1;
      ratingValue.value = rating;

      stars.forEach((s, i) => {
        if (i < rating) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
    });

    star.addEventListener("mouseenter", () => {
      const rating = index + 1;
      stars.forEach((s, i) => {
        s.style.color = i < rating ? "#ffa500" : "#ddd";
      });
    });
  });

  ratingInput.addEventListener("mouseleave", () => {
    const currentRating = parseInt(ratingValue.value) || 0;
    stars.forEach((s, i) => {
      s.style.color = i < currentRating ? "#ffa500" : "#ddd";
    });
  });

  // Character count
  commentInput.addEventListener("input", () => {
    charCount.textContent = commentInput.value.length;
  });

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitReview(form);
  });
}

// Submit review
async function submitReview(form) {
  const formMessage = document.getElementById("formMessage");
  const submitButton = form.querySelector(".btn-submit");

  // Validate rating
  const rating = document.getElementById("rating").value;
  if (!rating) {
    showMessage("評価を選択してください", "error");
    return;
  }

  // Prepare data
  const formData = {
    reviewer_name: document.getElementById("reviewerName").value.trim(),
    rating: parseInt(rating),
    comment: document.getElementById("comment").value.trim(),
    visit_date: document.getElementById("visitDate").value || null,
  };

  // Disable button
  submitButton.disabled = true;
  submitButton.textContent = "投稿中...";

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "投稿に失敗しました");
    }

    // Success
    showMessage("口コミを投稿しました！ありがとうございます。", "success");
    form.reset();

    // Reset stars
    document
      .querySelectorAll(".star-input")
      .forEach((s) => s.classList.remove("active"));
    document.getElementById("charCount").textContent = "0";

    // Reload reviews
    await loadReviews();

    // Scroll to reviews
    setTimeout(() => {
      document.getElementById("reviews").scrollIntoView({ behavior: "smooth" });
    }, 1000);
  } catch (error) {
    console.error("Error submitting review:", error);
    showMessage(error.message, "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "口コミを投稿する";
  }
}

// Show message
function showMessage(message, type) {
  const formMessage = document.getElementById("formMessage");
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;

  setTimeout(() => {
    formMessage.className = "form-message";
  }, 5000);
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
