"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Button from "../../components/ui/Button";
import { UserPlus, UserCheck } from "lucide-react";

export default function FollowButton({ sellerId }: { sellerId: string }) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user && user.id !== sellerId) {
        setCurrentUserId(user.id);
        const { data } = await supabase
          .from("follows")
          .select("follower_id")
          .eq("follower_id", user.id)
          .eq("seller_id", sellerId)
          .maybeSingle();
        setFollowing(!!data);
      }
      setReady(true);
    });
  }, [sellerId]);

  const toggleFollow = async () => {
    if (!currentUserId) return;
    setLoading(true);
    if (following) {
      await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("seller_id", sellerId);
      setFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: currentUserId, seller_id: sellerId });
      setFollowing(true);
    }
    setLoading(false);
  };

  if (!ready || !currentUserId) return null;

  return (
    <Button
      variant={following ? "secondary" : "primary"}
      onClick={toggleFollow}
      disabled={loading}
      className="text-[13px] px-4 py-2"
    >
      {following ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
    </Button>
  );
}
