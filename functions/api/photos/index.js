// Get all user photos
export async function onRequestGet(context) {
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM photos ORDER BY created_at DESC"
    ).all();

    // Add full URLs to photos
    const photosWithUrls = results.map((photo) => ({
      ...photo,
      url: `/photos/${photo.filename}`,
    }));

    return new Response(JSON.stringify({ photos: photosWithUrls }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch photos" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
