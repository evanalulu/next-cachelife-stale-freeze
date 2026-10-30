import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);

  const path = searchParams.get("path");
  if (path) {
    revalidatePath(path);
    return Response.json({ path });
  }

  const tag = searchParams.get("tag") ?? "";
  revalidateTag(tag, "max");
  return Response.json({ tag });
}
