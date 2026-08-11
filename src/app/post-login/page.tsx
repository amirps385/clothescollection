import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Landing hop after sign-in. The login form is a client component and can't see
 * the freshly-issued session, so the role check happens here on the server:
 * staff go straight to the dashboard, customers to their account.
 */
export default async function PostLoginPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  redirect(session.user.role === "ADMIN" ? "/admin" : "/account");
}
