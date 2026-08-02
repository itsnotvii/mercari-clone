 "use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Camera, Save, Lock, Mail } from "lucide-react";

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

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ color: "rgba(0,0,0,0.3)", fontSize: 14 }}>Loading...</p>
    </div>
  );

  const border = "rgba(0,0,0,0.07)";
  const muted = "rgba(0,0,0,0.4)";
  const input = "rgba(0,0,0,0.04)";

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9fb", fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ background: "rgba(255,255,255,0.9)", borderBottom: `1px solid ${border}`, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: muted, fontSize: 13, fontWeight: 600 }}>
            <ArrowLeft size={15} /> Back
          </Link>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#0a0a0f", marginLeft: 8 }}>Settings</span>
        </div>
      </nav>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 64px" }}>

        {message && (
          <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 10, background: message.includes("wrong") || message.includes("match") ? "rgba(255,59,59,0.08)" : "rgba(34,197,94,0.08)", border: `1px solid ${message.includes("wrong") || message.includes("match") ? "rgba(255,59,59,0.2)" : "rgba(34,197,94,0.2)"}`, color: message.includes("wrong") || message.includes("match") ? "#ff3b3b" : "#16a34a", fontSize: 13, fontWeight: 500 }}>
            {message}
          </div>
        )}

        {/* Avatar + profile */}
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${border}`, padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Profile</h2>

          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #ff3b3b, #ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}>{form.username?.[0]?.toUpperCase() || "?"}</span>
                )}
              </div>
              <button
                onClick={() => document.getElementById("avatar-input")?.click()}
                style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "#0a0a0f", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <Camera size={11} color="#fff" />
              </button>
              <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatar} style={{ display: "none" }} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0a0a0f" }}>{form.username || "No username"}</p>
              <p style={{ fontSize: 12, color: muted, marginTop: 2 }}>Click the camera to update your photo</p>
            </div>
          </div>

          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: muted, marginBottom: 6 }}>Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="your_username"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${border}`, background: input, fontSize: 13, outline: "none", boxSizing: "border-box", color: "#0a0a0f" }}
            />
          </div>

          {/* Bio */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: muted, marginBottom: 6 }}>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell people a bit about yourself..."
              rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${border}`, background: input, fontSize: 13, outline: "none", boxSizing: "border-box", resize: "none", color: "#0a0a0f", fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "#0a0a0f", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", opacity: saving ? 0.5 : 1 }}
          >
            <Save size={13} /> {saving ? "Saving..." : "Save profile"}
          </button>
        </div>

        {/* Email */}
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${border}`, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Mail size={15} color={muted} />
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Email address</h2>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: muted, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${border}`, background: input, fontSize: 13, outline: "none", boxSizing: "border-box", color: "#0a0a0f" }}
            />
          </div>
          <button
            onClick={handleChangeEmail}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "#0a0a0f", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", opacity: saving ? 0.5 : 1 }}
          >
            <Save size={13} /> Update email
          </button>
        </div>

        {/* Password */}
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${border}`, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Lock size={15} color={muted} />
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Password</h2>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: muted, marginBottom: 6 }}>New password</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              placeholder="••••••••"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${border}`, background: input, fontSize: 13, outline: "none", boxSizing: "border-box", color: "#0a0a0f" }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: muted, marginBottom: 6 }}>Confirm new password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="••••••••"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${border}`, background: input, fontSize: 13, outline: "none", boxSizing: "border-box", color: "#0a0a0f" }}
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "#0a0a0f", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", opacity: saving ? 0.5 : 1 }}
          >
            <Lock size={13} /> Update password
          </button>
        </div>
      </main>
    </div>
  );
}