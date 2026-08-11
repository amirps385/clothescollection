import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountNav } from "@/components/account/AccountNav";
import { DetailsForm, PasswordForm } from "@/components/account/ProfileForms";

export const metadata = { title: "My Details" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, phone: true, email: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl">My Details</h1>

      <div className="mt-8">
        <AccountNav />
      </div>

      <div className="mt-8 space-y-6">
        <DetailsForm
          initialName={user.name ?? ""}
          initialPhone={user.phone ?? ""}
          email={user.email}
        />
        <PasswordForm />
      </div>
    </div>
  );
}
