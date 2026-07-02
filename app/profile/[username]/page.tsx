import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) notFound();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", profile.id)
    .eq("sold", false)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screent bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-red-500">
            mercari
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center"
        </div>
      </main>
    </div>
  )
}