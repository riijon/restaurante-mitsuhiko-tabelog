// Photo upload API endpoint
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const photos = formData.getAll("photos");
    const caption = formData.get("caption") || null;
    const uploader_name = formData.get("uploader_name") || null;

    if (!photos || photos.length === 0) {
      return new Response(JSON.stringify({ error: "写真を選択してください" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Validate file count
    if (photos.length > 5) {
      return new Response(
        JSON.stringify({ error: "一度に5枚までアップロード可能です" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const uploadedPhotos = [];

    for (const photo of photos) {
      // Validate file
      if (!(photo instanceof File)) continue;

      // Check file size (5MB limit)
      if (photo.size > 5 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: "ファイルサイズは5MB以下にしてください" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      // Check file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(photo.type)) {
        return new Response(
          JSON.stringify({
            error: "JPEG、PNG、WebP形式の画像のみアップロード可能です",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const ext = photo.name.split(".").pop();
      const filename = `${timestamp}-${randomStr}.${ext}`;

      // Upload to R2
      await env.PHOTOS.put(filename, photo.stream(), {
        httpMetadata: {
          contentType: photo.type,
        },
      });

      // Save metadata to D1
      const result = await env.DB.prepare(
        "INSERT INTO photos (filename, caption, uploader_name, file_size) VALUES (?, ?, ?, ?)"
      )
        .bind(filename, caption, uploader_name, photo.size)
        .run();

      uploadedPhotos.push({
        id: result.meta.last_row_id,
        filename: filename,
        url: `/photos/${filename}`,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        photos: uploadedPhotos,
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
    console.error("Error uploading photos:", error);
    return new Response(
      JSON.stringify({ error: "写真のアップロードに失敗しました" }),
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
