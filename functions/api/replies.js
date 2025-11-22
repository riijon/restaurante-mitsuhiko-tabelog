// Cloudflare Pages Functions API endpoint for replies
// This file will be deployed as /api/replies

export async function onRequestGet(context) {
  const { env } = context;

  try {
    // Get all replies from D1 database
    const { results } = await env.DB.prepare(
      "SELECT * FROM replies ORDER BY created_at ASC"
    ).all();

    return new Response(JSON.stringify({ replies: results }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error fetching replies:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch replies" }), {
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
    const { review_id, reply_text, username, password } = body;

    // Validate authentication
    // Note: In production, use environment variables for credentials
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "ユーザー名とパスワードを入力してください" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Simple authentication check - username should be "yusa"
    // Password should be provided by the user
    if (username !== "yusa") {
      return new Response(
        JSON.stringify({ error: "ユーザー名またはパスワードが正しくありません" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // For demo purposes, accept any password when username is correct
    // In production, implement proper authentication with env.STORE_PASSWORD

    // Validate input
    if (!review_id || !reply_text) {
      return new Response(
        JSON.stringify({ error: "返信内容を入力してください" }),
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
    if (reply_text.length > 500) {
      return new Response(
        JSON.stringify({ error: "返信は500文字以内で入力してください" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Check if review exists
    const review = await env.DB.prepare(
      "SELECT id FROM reviews WHERE id = ?"
    )
      .bind(review_id)
      .first();

    if (!review) {
      return new Response(
        JSON.stringify({ error: "指定された口コミが見つかりません" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Check if reply already exists for this review
    const existingReply = await env.DB.prepare(
      "SELECT id FROM replies WHERE review_id = ?"
    )
      .bind(review_id)
      .first();

    if (existingReply) {
      return new Response(
        JSON.stringify({ error: "この口コミには既に返信が投稿されています" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Insert reply into database
    const result = await env.DB.prepare(
      "INSERT INTO replies (review_id, reply_text) VALUES (?, ?)"
    )
      .bind(review_id, reply_text)
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
    console.error("Error creating reply:", error);
    return new Response(
      JSON.stringify({ error: "返信の投稿に失敗しました" }),
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
