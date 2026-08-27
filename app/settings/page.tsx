"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Camera, Save, Lock, Mail } from "lucide-react";
import AppNav from "../components/ui/AppNav";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    username: "",
    bio: "",
    email: "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/auth"); return; }
      setUserId(user.id);
      setForm((f) => ({ ...f, email: user.email || "" }));

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setForm((f) => ({ ...f, username: profile.username || "", bio: profile.bio || "" }));
        if (profile.avatar_url) setAvatarPreview(profile.avatar_url);
      }
      setLoading(false);
    });
  }, [router]);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    setMessage("");

    try {
      let avatarUrl = avatarPreview;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `avatars/${userId}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(path, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ username: form.username, bio: form.bio, avatar_url: avatarUrl })
        .eq("id", userId);

      if (error) throw error;
      setMessage("Profile saved!");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async () => {
    setSaving(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ email: form.email });
      if (error) throw error;
      setMessage("Confirmation sent to new email!");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setMessage("Passwords don't match");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      setMessage("Password updated!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-subtle)] text-sm outline-none focus:border-[var(--color-brand)] transition-colors box-border";
  const labelClass = "block text-xs font-semibold text-[var(--color-muted)] mb-1.5";
  const isError = message.includes("wrong") || message.includes("match");

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--color-muted)] text-sm">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <AppNav maxWidthClassName="max-w-[720px]" rightSlot={<span className="font-extrabold text-base">Settings</span>} />

      <main className="max-w-[720px] mx-auto px-6 py-8 pb-16">
        {message && (
          <div className={`mb-5 px-4 py-3 rounded-[10px] border text-[13px] font-medium ${
            isError
              ? "bg-red-500/10 border-red-500/20 text-red-500"
              : "bg-green-500/10 border-green-500/20 text-green-600"
          }`}>
            {message}
          </div>
        )}

        {/* Avatar + profile */}
        <Card className="mb-4">
          <h2 className="text-[15px] font-bold mb-5">Profile</h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-[72px] h-[72px] rounded-full bg-[linear-gradient(135deg,var(--color-brand-start),var(--color-brand-end))] flex items-center justify-center overflow-hidden shadow-[var(--shadow-glow-brand-sm)]">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-extrabold">{form.username?.[0]?.toUpperCase() || "?"}</span>
                )}
              </div>
              <button
                onClick={() => document.getElementById("avatar-input")?.click()}
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[var(--color-text)] border-2 border-[var(--color-surface)] flex items-center justify-center"
              >
                <Camera size={11} className="text-[var(--color-bg)]" />
              </button>
              <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </div>
            <div>
              <p className="text-[15px] font-bold">{form.username || "No username"}</p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">Click the camera to update your photo</p>
            </div>
          </div>

          <div className="mb-4">
            <label className={labelClass}>Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="your_username"
              className={inputClass}
            />
          </div>

          <div className="mb-5">
            <label className={labelClass}>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell people a bit about yourself..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="text-[13px] py-2.5">
            <Save size={13} /> {saving ? "Saving..." : "Save profile"}
          </Button>
        </Card>

        {/* Email */}
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-5">
            <Mail size={15} className="text-[var(--color-muted)]" />
            <h2 className="text-[15px] font-bold">Email address</h2>
          </div>
          <div className="mb-4">
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
          </div>
          <Button onClick={handleChangeEmail} disabled={saving} className="text-[13px] py-2.5">
            <Save size={13} /> Update email
          </Button>
        </Card>

        {/* Password */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Lock size={15} className="text-[var(--color-muted)]" />
            <h2 className="text-[15px] font-bold">Password</h2>
          </div>
          <div className="mb-3">
            <label className={labelClass}>New password</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>
          <div className="mb-5">
            <label className={labelClass}>Confirm new password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>
          <Button onClick={handleChangePassword} disabled={saving} className="text-[13px] py-2.5">
            <Lock size={13} /> Update password
          </Button>
        </Card>
      </main>
    </div>
  );
}
