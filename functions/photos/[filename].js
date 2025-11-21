// Serve photos from R2
export async function onRequest(context) {
  const { request, env } = context;

  try {
    // Extract filename from URL path
    const url = new URL(request.url);
    const filename = url.pathname.split("/photos/")[1];

    if (!filename) {
      return new Response("Photo not found", { status: 404 });
    }

    // Get photo from R2
    const object = await env.PHOTOS.get(filename);

    if (!object) {
      return new Response("Photo not found", { status: 404 });
    }

    // Return the photo
    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error serving photo:", error);
    return new Response("Error loading photo", { status: 500 });
  }
}
