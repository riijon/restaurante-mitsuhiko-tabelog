// Cloudflare Pages Functions API endpoint for reviews
// This file will be deployed as /api/reviews

export async function onRequestGet(context) {
  const { env } = context;

  try {
    // Get all reviews from D1 database
    const { results } = await env.DB.prepare(
      "SELECT * FROM reviews ORDER BY created_at DESC"
    ).all();

    return new Response(JSON.stringify({ reviews: results }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch reviews" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Parse request body
    const body = await request.json();
    const { reviewer_name, rating, comment, visit_date } = body;

    // Validate input
    if (!reviewer_name || !rating || !comment) {
      return new Response(
        JSON.stringify({ error: "必須項目を入力してください" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ error: "評価は1〜5の範囲で選択してください" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Validate length
    if (reviewer_name.length > 50) {
      return new Response(
        JSON.stringify({ error: "名前は50文字以内で入力してください" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (comment.length > 1000) {
      return new Response(
        JSON.stringify({ error: "口コミは1000文字以内で入力してください" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Insert review into database
    const result = await env.DB.prepare(
      "INSERT INTO reviews (reviewer_name, rating, comment, visit_date) VALUES (?, ?, ?, ?)"
    )
      .bind(reviewer_name, rating, comment, visit_date)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        id: result.meta.last_row_id,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return new Response(
      JSON.stringify({ error: "口コミの投稿に失敗しました" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
