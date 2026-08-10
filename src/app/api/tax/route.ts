import { NextRequest, NextResponse } from "next/server";
import { calculateOrderTax } from "@/lib/tax";

export async function POST(req: NextRequest) {
  const { items, shippingState } = await req.json();
  const result = calculateOrderTax(items, shippingState);
  return NextResponse.json(result);
}
