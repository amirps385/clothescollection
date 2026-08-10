import { NextRequest, NextResponse } from "next/server";
import { getShippingOptions } from "@/lib/shipping";

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country") ?? "IN";
  const subtotal = Number(req.nextUrl.searchParams.get("subtotal") ?? 0);

  const options = await getShippingOptions(country, subtotal);

  return NextResponse.json({ options });
}
