import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";

interface SuccessPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const { order: orderNumber } = await searchParams;

  const order = orderNumber
    ? await prisma.order.findUnique({ where: { orderNumber } })
    : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
        ✓
      </div>
      <h1 className="mt-6 font-serif text-4xl">Thank You!</h1>
      <p className="mt-4 text-izhaana-charcoal/60">
        Your order has been placed successfully.
      </p>
      {order && (
        <p className="mt-2 font-medium">
          Order Number: {order.orderNumber}
        </p>
      )}
      <p className="mt-2 text-sm text-izhaana-charcoal/50">
        A confirmation email has been sent to your inbox.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/shop">
          <Button>Continue Shopping</Button>
        </Link>
        <Link href="/account">
          <Button variant="outline">View Orders</Button>
        </Link>
      </div>
    </div>
  );
}
