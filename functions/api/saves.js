// Save/bookmark counter
export async function onRequestPost({ env }) {
  try {
    await env.DB.prepare("INSERT INTO saves (created_at) VALUES (CURRENT_TIMESTAMP)").run();

    const { results } = await env.DB.prepare(
      "SELECT COUNT(*) as saveCount FROM saves"
    ).all();

    const saveCount = results[0]?.saveCount || 0;

    return new Response(JSON.stringify({ success: true, saveCount }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error incrementing saves:", error);
    return new Response(
      JSON.stringify({ error: "保存のカウントに失敗しました" }),
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
