export interface GstBreakdown {
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  rate: number;
}

export function calculateGst(
  amount: number,
  gstRate: number,
  isInterState = false
): GstBreakdown {
  const totalGst = (amount * gstRate) / 100;

  if (isInterState) {
    return {
      cgst: 0,
      sgst: 0,
      igst: totalGst,
      totalGst,
      rate: gstRate,
    };
  }

  const half = totalGst / 2;
  return {
    cgst: half,
    sgst: half,
    igst: 0,
    totalGst,
    rate: gstRate,
  };
}

export function calculateOrderTax(
  items: { price: number; quantity: number; gstRate: number }[],
  shippingState: string,
  storeState = "Maharashtra"
) {
  const isInterState = shippingState.toLowerCase() !== storeState.toLowerCase();
  let totalTax = 0;
  const breakdown: Record<number, GstBreakdown> = {};

  for (const item of items) {
    const lineTotal = item.price * item.quantity;
    const gst = calculateGst(lineTotal, item.gstRate, isInterState);
    totalTax += gst.totalGst;
    breakdown[item.gstRate] = breakdown[item.gstRate]
      ? {
          ...breakdown[item.gstRate],
          cgst: breakdown[item.gstRate].cgst + gst.cgst,
          sgst: breakdown[item.gstRate].sgst + gst.sgst,
          igst: breakdown[item.gstRate].igst + gst.igst,
          totalGst: breakdown[item.gstRate].totalGst + gst.totalGst,
        }
      : gst;
  }

  return { totalTax, breakdown, isInterState };
}
