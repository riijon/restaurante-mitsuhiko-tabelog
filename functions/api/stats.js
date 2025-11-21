// Aggregated stats for reviews and saves
export async function onRequestGet({ env }) {
  try {
    const reviewQuery = await env.DB.prepare(
      "SELECT COUNT(*) as reviewCount, AVG(rating) as averageRating FROM reviews"
    ).all();

    const saveQuery = await env.DB.prepare(
      "SELECT COUNT(*) as saveCount FROM saves"
    ).all();

    const { reviewCount = 0, averageRating = null } = reviewQuery.results[0] || {};
    const { saveCount = 0 } = saveQuery.results[0] || {};

    return new Response(
      JSON.stringify({
        reviewCount,
        averageRating: averageRating ? Number(averageRating) : 0,
        saveCount,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch stats" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
