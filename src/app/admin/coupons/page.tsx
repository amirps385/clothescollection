import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Coupons" };

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-serif text-3xl">Coupons & Discounts</h1>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="border-b border-izhaana-charcoal/10 text-left">
              <th className="p-3 font-medium">Code</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Value</th>
              <th className="p-3 font-medium">Usage</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-izhaana-charcoal/5">
                <td className="p-3 font-mono font-medium">{coupon.code}</td>
                <td className="p-3 capitalize">{coupon.type.toLowerCase()}</td>
                <td className="p-3">
                  {coupon.type === "PERCENTAGE"
                    ? `${coupon.value}%`
                    : formatPrice(coupon.value)}
                </td>
                <td className="p-3">
                  {coupon.usedCount}
                  {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs ${
                      coupon.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {coupon.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
