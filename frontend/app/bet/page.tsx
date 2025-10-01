export default function BetIndexPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-gray-600">
        <p>Visit a specific bet at /bet/[id].</p>
        <a href="/prediction" className="text-blue-600 underline">Go to Markets</a>
      </div>
    </div>
  );
}
