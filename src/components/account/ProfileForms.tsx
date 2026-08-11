"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Notice = { kind: "ok" | "err"; text: string } | null;

function NoticeLine({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <p
      className={`text-sm ${
        notice.kind === "ok" ? "text-green-700" : "text-red-600"
      }`}
    >
      {notice.text}
    </p>
  );
}

export function DetailsForm({
  initialName,
  initialPhone,
  email,
}: {
  initialName: string;
  initialPhone: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice(null);

    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (res.ok) {
      setNotice({ kind: "ok", text: data.message ?? "Details saved" });
      router.refresh();
    } else {
      setNotice({ kind: "err", text: data.error ?? "Could not save your details" });
    }
  }

  return (
    <form
      onSubmit={save}
      className="space-y-5 border border-izhaana-charcoal/10 bg-white p-6"
    >
      <h2 className="font-serif text-xl">My details</h2>

      <Input id="email" label="Email" value={email} readOnly className="bg-izhaana-cream" />

      <Input
        id="name"
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
      />

      <Input
        id="phone"
        label="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="e.g. +91 98765 43210"
      />

      <NoticeLine notice={notice} />

      <Button type="submit" loading={saving}>
        Save details
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);

    if (newPassword !== confirm) {
      setNotice({ kind: "err", text: "The new passwords don't match" });
      return;
    }

    setSaving(true);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (res.ok) {
      setNotice({ kind: "ok", text: data.message ?? "Password updated" });
      setCurrent("");
      setNext("");
      setConfirm("");
    } else {
      setNotice({ kind: "err", text: data.error ?? "Could not change your password" });
    }
  }

  return (
    <form
      onSubmit={save}
      className="space-y-5 border border-izhaana-charcoal/10 bg-white p-6"
    >
      <h2 className="font-serif text-xl">Change password</h2>

      <Input
        id="currentPassword"
        label="Current password"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrent(e.target.value)}
      />
      <Input
        id="newPassword"
        label="New password"
        type="password"
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNext(e.target.value)}
      />
      <Input
        id="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      <NoticeLine notice={notice} />

      <Button type="submit" loading={saving}>
        Update password
      </Button>
    </form>
  );
}
