import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const forbidden = await requireAdminResponse();
  if (forbidden) return forbidden;

  const formData = await request.formData();
  const files = formData.getAll("images").filter((file): file is File => file instanceof File);

  if (!files.length) {
    return NextResponse.json({ error: "No images selected" }, { status: 400 });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 });
  }

  const uploads = await Promise.all(
    files.map(async (file) => {
      if (!file.type.startsWith("image/")) {
        throw new Error(`${file.name} is not an image`);
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "brew-and-bite/foods",
        resource_type: "image",
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }),
  );

  return NextResponse.json({ images: uploads });
}
