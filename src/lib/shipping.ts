import { prisma } from "@/lib/prisma";

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  carrier: string;
}

const FALLBACK_RATES: ShippingOption[] = [
  {
    id: "standard",
    name: "Standard Shipping",
    price: 99,
    estimatedDays: "5-7 business days",
    carrier: "India Post",
  },
  {
    id: "express",
    name: "Express Shipping",
    price: 199,
    estimatedDays: "2-3 business days",
    carrier: "Delhivery",
  },
  {
    id: "premium",
    name: "Premium Delivery",
    price: 349,
    estimatedDays: "1-2 business days",
    carrier: "BlueDart",
  },
];

export async function getShippingOptions(
  country: string,
  orderSubtotal: number
): Promise<ShippingOption[]> {
  const zones = await prisma.shippingZone.findMany({
    include: { rates: true },
  });

  const options: ShippingOption[] = [];

  for (const zone of zones) {
    const countries: string[] = JSON.parse(zone.countries);
    if (!countries.includes(country) && !countries.includes("*")) continue;

    for (const rate of zone.rates) {
      if (rate.minOrder && orderSubtotal < rate.minOrder) continue;
      options.push({
        id: rate.id,
        name: rate.name,
        price: orderSubtotal >= 2999 ? 0 : rate.price,
        estimatedDays: rate.estimatedDays ?? "5-7 business days",
        carrier: rate.carrier,
      });
    }
  }

  if (options.length === 0) {
    return FALLBACK_RATES.map((r) => ({
      ...r,
      price: orderSubtotal >= 2999 ? 0 : r.price,
    }));
  }

  return options;
}

export function getFreeShippingThreshold() {
  return 2999;
}
