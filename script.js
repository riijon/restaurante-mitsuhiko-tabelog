// API endpoints
const API_ENDPOINT = "/api/reviews";
const PHOTOS_API = "/api/photos";
const UPLOAD_API = "/api/photos/upload";
const STATS_API = "/api/stats";
const SAVE_API = "/api/saves";

// User icon options
const USER_ICONS = ["🍔", "🍷", "👤", "🍜", "🍰"];

// Local state
let cachedReviews = [];
let showAllReviews = false;
let currentSaveCount = 0;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadReviews();
  loadUserPhotos();
  initializeModals();
  initializeReviewForm();
  initializePhotoUpload();
  initializeTabNavigation();
  initializeSPNavigation();
  initializeSearchAlerts();
  initializeIconSelector();
  initializeReviewToggle();
  initializeReviewExpandHandlers();
  initializeSaveButtons();
});

// Initialize Modals
function initializeModals() {
  // Photo Modal
  const photoModal = document.getElementById("photoModal");
  const openPhotoBtn = document.getElementById("openPhotoModal");
  const closePhotoBtn = document.getElementById("closePhotoModal");

  if (openPhotoBtn && photoModal) {
    openPhotoBtn.addEventListener("click", () => {
      photoModal.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    });
  }

  if (closePhotoBtn && photoModal) {
    closePhotoBtn.addEventListener("click", () => {
      photoModal.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  // Review Modal
  const reviewModal = document.getElementById("reviewModal");
  const openReviewBtn = document.getElementById("openReviewModalBtn"); // From SP Nav
  const openReviewBtnPC = document.getElementById("openReviewModalBtnPC"); // From PC Nav
  const closeReviewBtn = document.getElementById("closeReviewModal");

  // Open review modal from SP Nav
  if (openReviewBtn && reviewModal) {
    openReviewBtn.addEventListener("click", (e) => {
      e.preventDefault();
      reviewModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  // Open review modal from PC Nav
  if (openReviewBtnPC && reviewModal) {
    openReviewBtnPC.addEventListener("click", (e) => {
      e.preventDefault();
      reviewModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  if (closeReviewBtn && reviewModal) {
    closeReviewBtn.addEventListener("click", () => {
      reviewModal.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  // Close on click outside
  window.addEventListener("click", (e) => {
    if (e.target === photoModal) {
      photoModal.classList.remove("active");
      document.body.style.overflow = "";
    }
    if (e.target === reviewModal) {
      reviewModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
}

// Initialize icon selector
function initializeIconSelector() {
  const iconSelector = document.getElementById("iconSelector");
  const userIconInput = document.getElementById("userIcon");

  if (!iconSelector) return;

  // Clear existing
  iconSelector.innerHTML = "";

  // Create icon options
  USER_ICONS.forEach((icon) => {
    const iconBtn = document.createElement("button");
    iconBtn.type = "button";
    iconBtn.className = "icon-option";
    iconBtn.textContent = icon;
    iconBtn.dataset.icon = icon;

    if (icon === "👤") {
      iconBtn.classList.add("selected");
    }

    iconBtn.addEventListener("click", () => {
      // Remove selected class from all icons
      iconSelector.querySelectorAll(".icon-option").forEach((opt) => {
        opt.classList.remove("selected");
      });

      // Add selected class to clicked icon
      iconBtn.classList.add("selected");
      userIconInput.value = icon;
    });

    iconSelector.appendChild(iconBtn);
  });
}

// Initialize search alerts (PC only - non-functional)
function initializeSearchAlerts() {
  const searchArea = document.getElementById("searchArea");
  const searchQuery = document.getElementById("searchQuery");

  if (searchArea) {
    searchArea.addEventListener("click", () => {
      alert("検索機能はデモサイトでは利用できません");
    });
  }

  if (searchQuery) {
    searchQuery.addEventListener("click", () => {
      alert("検索機能はデモサイトでは利用できません");
    });
  }
}

function initializeReviewToggle() {
  const toggleBtn = document.getElementById("toggleReviewsBtn");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    showAllReviews = !showAllReviews;
    renderReviews();
  });
}

function initializeReviewExpandHandlers() {
  const containers = [
    document.getElementById("reviewsList"),
    document.getElementById("pickupReview"),
  ];

  containers.forEach((container) => {
    if (!container) return;
    container.addEventListener("click", (e) => {
      const card = e.target.closest(".review-card");
      if (!card) return;
      card.classList.toggle("expanded");
    });
  });
}

// Tab Navigation
function initializeTabNavigation() {
  const tabLinks = document.querySelectorAll(".tab-link");
  const menuTooltip = document.getElementById("menuTooltip");

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

      if (link.id === "menuTabLink" && menuTooltip) {
        // Calculate tooltip position relative to menu button (fixed positioning)
        const menuButtonRect = link.getBoundingClientRect();
        menuTooltip.style.top = `${menuButtonRect.bottom + 6}px`;
        menuTooltip.style.left = `${menuButtonRect.left + menuButtonRect.width / 2}px`;
        menuTooltip.classList.add("show");
        setTimeout(() => menuTooltip.classList.remove("show"), 1500);
      }
    });
  });
}

// SP Fixed Navigation
function initializeSPNavigation() {
  const visitedBtn = document.getElementById("spVisitedBtn");
  const shareBtn = document.getElementById("spShareBtn");
  const reviewModal = document.getElementById("reviewModal");

  // "Visited" button opens review modal now (or scrolls to it if we kept it inline, but user asked for modal)
  if (visitedBtn && reviewModal) {
    visitedBtn.addEventListener("click", () => {
      reviewModal.classList.add("active");
      document.body.style.overflow = "hidden";

      // Focus on name input
      setTimeout(() => {
        const nameInput = document.getElementById("reviewerName");
        if (nameInput) nameInput.focus();
      }, 100);
    });
  }

  // Share button copies URL
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      await copyPageUrl();
      const tooltip = document.getElementById("shareTooltip");
      if (tooltip) {
        tooltip.classList.add("show");
        setTimeout(() => tooltip.classList.remove("show"), 1500);
      }
    });
  }
}

// Save/bookmark buttons
function initializeSaveButtons() {
  const buttons = [document.getElementById("saveBtn"), document.getElementById("spSaveBtn")].filter(
    Boolean
  );

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => handleSaveAction(btn));
  });
}

async function handleSaveAction(button) {
  if (!button) return;
  if (button.classList.contains("saved")) return;
  const labelEl = button.querySelector(".sp-nav-label");
  const originalText = labelEl ? labelEl.textContent : button.textContent;

  button.disabled = true;
  if (labelEl) {
    labelEl.textContent = "保存中...";
  } else {
    button.textContent = "保存中...";
  }

  try {
    const response = await fetch(SAVE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "保存に失敗しました");
    }

    const data = await response.json();
    updateCounts({ saveCount: data.saveCount || currentSaveCount + 1 });
    markSaved();
  } catch (error) {
    console.error("Error saving:", error);
    alert(error.message || "保存に失敗しました");
    if (labelEl) {
      labelEl.textContent = originalText;
    } else {
      button.textContent = originalText;
    }
  } finally {
    button.disabled = false;
  }
}

function markSaved() {
  const buttons = [document.getElementById("saveBtn"), document.getElementById("spSaveBtn")].filter(
    Boolean
  );

  buttons.forEach((btn) => {
    btn.classList.add("saved");
    btn.disabled = true;

    const label = btn.querySelector(".sp-nav-label");
    if (label) {
      label.textContent = "保存済み";
    } else {
      btn.textContent = "保存済み";
    }
  });

  const metricSaveIcons = document.querySelectorAll(".metric-save-icon");
  metricSaveIcons.forEach((icon) => {
    if (icon.classList.contains("line")) {
      icon.style.display = "none";
    } else if (icon.classList.contains("filled")) {
      icon.style.display = "inline";
    }
  });
}

async function copyPageUrl() {
  try {
    await navigator.clipboard.writeText(window.location.href);
  } catch (error) {
    console.error("Clipboard copy failed:", error);
    alert("URLコピーに失敗しました");
  }
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
    cachedReviews = data.reviews || [];
    showAllReviews = false;

    // Update rating and counts based on DB data
    updateRating(cachedReviews);
    updateCounts({ reviewCount: cachedReviews.length });

    renderPickupReview();
    renderReviews();
  } catch (error) {
    console.error("Error loading reviews:", error);
    reviewsList.innerHTML =
      '<div class="loading">口コミの読み込みに失敗しました。ページを再読み込みしてください。</div>';
  }
}

// Load aggregated stats (counts/average/save)
async function loadStats() {
  try {
    const response = await fetch(STATS_API);
    if (!response.ok) throw new Error("Failed to load stats");
    const data = await response.json();
    currentSaveCount = data.saveCount || 0;

    updateCounts({
      reviewCount: data.reviewCount || 0,
      saveCount: currentSaveCount,
    });

    setRatingDisplay(
      data.reviewCount || 0,
      data.averageRating ? Number(data.averageRating) : 0
    );
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

// Select pickup review (random)
function selectPickupReview(reviews) {
  if (reviews.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * reviews.length);
  return reviews[randomIndex];
}

function renderPickupReview() {
  const pickupReview = document.getElementById("pickupReview");
  if (!pickupReview) return;

  if (cachedReviews.length === 0) {
    pickupReview.innerHTML =
      '<div class="loading">まだ口コミがありません。最初の口コミを投稿してみませんか？</div>';
    return;
  }

  const selectedPickup = selectPickupReview(cachedReviews);
  pickupReview.innerHTML = createReviewCardHTML(selectedPickup, true);
}

function renderReviews() {
  const reviewsList = document.getElementById("reviewsList");
  const toggleBtn = document.getElementById("toggleReviewsBtn");

  if (!reviewsList) return;

  if (cachedReviews.length === 0) {
    reviewsList.innerHTML =
      '<div class="loading">まだ口コミがありません。最初の口コミを投稿してみませんか？</div>';
  } else {
    const visibleReviews = showAllReviews
      ? cachedReviews
      : cachedReviews.slice(0, 3);

    reviewsList.innerHTML = visibleReviews
      .map((review) => createReviewCardHTML(review, false))
      .join("");
  }

  if (toggleBtn) {
    if (cachedReviews.length > 3) {
      toggleBtn.style.display = "inline-flex";
      toggleBtn.textContent = showAllReviews
        ? "閉じる"
        : `全て表示 (${cachedReviews.length}件)`;
    } else {
      toggleBtn.style.display = "none";
    }
  }
}

// Create review card HTML - Tabelog style
function createReviewCardHTML(review, isPickup = false) {
  const visitDate = review.visit_date
    ? new Date(review.visit_date).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
      })
    : null;

  const createdDate = new Date(review.created_at).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const stars = Array(5)
    .fill(0)
    .map((_, i) => "★")
    .join("");
  const filledStars = Array(review.rating)
    .fill(0)
    .map(() => "★")
    .join("");

  // Generate title from first line of comment
  const commentLines = review.comment.split("\n");
  const title =
    commentLines[0].substring(0, 50) +
    (commentLines[0].length > 50 ? "..." : "");

  // Excerpt: first 100 chars
  const excerpt =
    review.comment.substring(0, 80) +
    (review.comment.length > 80 ? "..." : "");

  // User icon
  const userIcon = review.user_icon || "👤";
  const fullComment = escapeHtml(review.comment);

  return `
        <div class="review-card ${isPickup ? "pickup-card" : ""}">
            <h3 class="review-title">${escapeHtml(title)}</h3>
            <p class="review-excerpt">${escapeHtml(excerpt)}</p>
            <div class="review-full">${fullComment}</div>
            <div class="review-rating">
                <span class="dinner-icon">🌙</span>
                <span class="stars">${filledStars}</span>
                <span class="score">${review.rating}.0</span>
            </div>
            <div class="review-user-info">
                <div class="user-icon">${userIcon}</div>
                <div class="user-details">
                    <div class="user-name-line">
                        <span class="username">${escapeHtml(
                          review.reviewer_name
                        )}</span>
                        <span class="review-count">(1)</span>
                        <span class="verified">✅認証済</span>
                    </div>
                    <div class="visit-info">
                        ${visitDate ? `${visitDate} 訪問` : createdDate} 1回
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Update rating display
function updateRating(reviews) {
  const count = reviews.length;
  const average =
    count > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / count
      : 0;
  setRatingDisplay(count, average);
}

function setRatingDisplay(count, average) {
  const reviewCount = document.getElementById("reviewCount");
  const visitedCount = document.getElementById("visitedCount");
  const avgRatingDisplay = document.getElementById("avgRating");
  const avgStars = document.getElementById("avgStars");

  if (reviewCount) reviewCount.textContent = count;
  if (visitedCount) visitedCount.textContent = count;

  const roundedAverage = count > 0 ? Math.round(average * 10) / 10 : 0;
  if (avgRatingDisplay) {
    avgRatingDisplay.textContent = roundedAverage.toFixed(2);
  }

  if (avgStars) {
    const fullStars = Math.floor(roundedAverage);
    avgStars.innerHTML = Array(5)
      .fill(0)
      .map((_, i) => {
        return `<span class="star ${i < fullStars ? "filled" : ""}">★</span>`;
      })
      .join("");
  }
}

function updateCounts({ reviewCount, saveCount }) {
  if (typeof reviewCount === "number") {
    const reviewCountEl = document.getElementById("reviewCount");
    const visitedCountEl = document.getElementById("visitedCount");
    if (reviewCountEl) reviewCountEl.textContent = reviewCount;
    if (visitedCountEl) visitedCountEl.textContent = reviewCount;
  }

  if (typeof saveCount === "number") {
    currentSaveCount = saveCount;
    const saveCountEl = document.getElementById("saveCount");
    if (saveCountEl) saveCountEl.textContent = currentSaveCount;

    const metricSaveIcons = document.querySelectorAll(".metric-save-icon");
    metricSaveIcons.forEach((icon) => {
      if (icon.classList.contains("line")) {
        icon.style.display = currentSaveCount > 0 ? "none" : "inline";
      } else if (icon.classList.contains("filled")) {
        icon.style.display = currentSaveCount > 0 ? "inline" : "none";
      }
    });
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
  const reviewModal = document.getElementById("reviewModal");

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
    user_icon: document.getElementById("userIcon").value,
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

    // Reset icon selector
    document.querySelectorAll(".icon-option").forEach((opt) => {
      opt.classList.remove("selected");
    });
    document
      .querySelector('.icon-option[data-icon="👤"]')
      .classList.add("selected");
    document.getElementById("userIcon").value = "👤";

    // Close modal after short delay
    setTimeout(() => {
      if (reviewModal) {
        reviewModal.classList.remove("active");
        document.body.style.overflow = "";
      }
      // Clear message
      formMessage.textContent = "";
      formMessage.className = "form-message";
    }, 2000);

    // Reload reviews
    await loadReviews();
    await loadStats();
  } catch (error) {
    console.error("Error submitting review:", error);
    showMessage(error.message, "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "口コミを投稿する";
  }
}

// Initialize photo upload
function initializePhotoUpload() {
  const form = document.getElementById("photoUploadForm");
  const fileInput = document.getElementById("photoFile");
  const thumbnailPreview = document.getElementById("thumbnailPreview");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await uploadPhotos();
    });
  }

  if (fileInput && thumbnailPreview) {
    fileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);

      // Clear existing previews
      thumbnailPreview.innerHTML = "";

      if (files.length === 0) return;

      files.forEach((file, index) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          const div = document.createElement("div");
          div.className = "thumbnail-item";

          const img = document.createElement("img");
          img.src = e.target.result;

          // Optional: Add remove button (would need complex logic to update FileList)
          // For now, just display

          div.appendChild(img);
          thumbnailPreview.appendChild(div);
        };
        reader.readAsDataURL(file);
      });
    });
  }
}

// Upload photos
async function uploadPhotos() {
  const fileInput = document.getElementById("photoFile");
  const caption = document.getElementById("photoCaption").value.trim();
  const uploader = document.getElementById("photoUploader").value.trim();
  const uploadBtn = document.querySelector(".btn-upload");
  const photoModal = document.getElementById("photoModal");
  const thumbnailPreview = document.getElementById("thumbnailPreview");

  const files = fileInput.files;

  if (files.length === 0) {
    showUploadMessage("写真を選択してください", "error");
    return;
  }

  // Validate file count
  if (files.length > 5) {
    showUploadMessage("一度に投稿できる写真は5枚までです", "error");
    return;
  }

  // Validate file sizes and types
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      showUploadMessage("ファイルサイズは5MB以下にしてください", "error");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showUploadMessage(
        "JPEG、PNG、WebP形式の画像のみアップロード可能です",
        "error"
      );
      return;
    }
  }

  // Disable button
  uploadBtn.disabled = true;
  uploadBtn.textContent = "アップロード中...";

  try {
    const formData = new FormData();

    // Add files
    for (const file of files) {
      formData.append("photos", file);
    }

    // Add metadata
    if (caption) formData.append("caption", caption);
    if (uploader) formData.append("uploader_name", uploader);

    const response = await fetch(UPLOAD_API, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "アップロードに失敗しました");
    }

    // Success
    showUploadMessage("写真を投稿しました！", "success");

    // Reset form
    document.getElementById("photoUploadForm").reset();
    if (thumbnailPreview) thumbnailPreview.innerHTML = "";

    // Close modal after delay
    setTimeout(() => {
      if (photoModal) {
        photoModal.classList.remove("active");
        document.body.style.overflow = "";
      }
      // Clear message
      const uploadMessage = document.getElementById("uploadMessage");
      if (uploadMessage) {
        uploadMessage.textContent = "";
        uploadMessage.className = "upload-message";
      }
    }, 2000);

    // Reload photos
    await loadUserPhotos();
  } catch (error) {
    console.error("Error uploading photos:", error);
    showUploadMessage(error.message, "error");
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "投稿する";
  }
}

// Load user photos
async function loadUserPhotos() {
  const photosGrid = document.getElementById("userPhotosGrid");

  try {
    const response = await fetch(PHOTOS_API);

    if (!response.ok) {
      throw new Error("Failed to load photos");
    }

    const data = await response.json();
    const photos = data.photos || [];

    if (photos.length === 0) {
      photosGrid.innerHTML =
        '<div class="loading">まだ投稿写真がありません。最初の写真を投稿してみませんか？</div>';
    } else {
      photosGrid.innerHTML = photos
        .map((photo) => createPhotoHTML(photo))
        .join("");
    }
  } catch (error) {
    console.error("Error loading photos:", error);
    photosGrid.innerHTML =
      '<div class="loading">投稿写真の読み込みに失敗しました</div>';
  }
}

// Create photo HTML
function createPhotoHTML(photo) {
  const uploadDate = new Date(photo.created_at).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
        <div class="user-photo-item">
            <div class="user-photo-image">
                <img src="${escapeHtml(photo.url)}" alt="${escapeHtml(
    photo.caption || ""
  )}">
            </div>
            <div class="user-photo-info">
                ${
                  photo.caption
                    ? `<div class="user-photo-caption">${escapeHtml(
                        photo.caption
                      )}</div>`
                    : ""
                }
                <div class="user-photo-meta">
                    ${
                      photo.uploader_name
                        ? `${escapeHtml(photo.uploader_name)} • `
                        : ""
                    }${uploadDate}
                </div>
            </div>
        </div>
    `;
}

// Show message
function showMessage(message, type) {
  const formMessage = document.getElementById("formMessage");
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
}

// Show upload message
function showUploadMessage(message, type) {
  const uploadMessage = document.getElementById("uploadMessage");
  uploadMessage.textContent = message;
  uploadMessage.className = `upload-message ${type}`;
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
