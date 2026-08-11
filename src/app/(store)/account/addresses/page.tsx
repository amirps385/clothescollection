import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountNav } from "@/components/account/AccountNav";
import { AddressBook } from "@/components/account/AddressBook";

export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl">Addresses</h1>
      <p className="mt-2 text-izhaana-charcoal/60">
        Saved addresses make checkout faster.
      </p>

      <div className="mt-8">
        <AccountNav />
      </div>

      <div className="mt-8">
        <AddressBook addresses={addresses} />
      </div>
    </div>
  );
}
