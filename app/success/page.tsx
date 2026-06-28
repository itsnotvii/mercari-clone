import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center max-w-sm">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold mb-2">Purchase Complete!</h2>
        <p className="text-gray-400 text-sm mb-6">
          Your order has been placed successfully.
        </p>
        <Link
          href="/"
          className="bg-red-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-red-600 transition"
        >
          Back to listings
        </Link>
      </div>
    </div>
  );
}