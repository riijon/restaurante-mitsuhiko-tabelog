-- Create reviews table for RISTORANTE MITSUHIKO
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reviewer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    visit_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster ordering by date
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
