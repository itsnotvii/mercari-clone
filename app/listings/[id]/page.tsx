import ListingPageClient from "./ListingPageClient";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ListingPageClient id={id} />;
}