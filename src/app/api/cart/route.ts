import { NextResponse } from "next/server";
import { getCartWithProducts } from "@/lib/cart-actions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getCartWithProducts();
    return NextResponse.json(items);
  } catch (error) {
    console.error("API Cart Error:", error);
    return NextResponse.json({ error: "Failed to fetch cart items" }, { status: 500 });
  }
}
