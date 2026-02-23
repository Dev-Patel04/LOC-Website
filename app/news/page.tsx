"use client";

export default function NewsPage() {
  return (
    <div className="px-4 py-4">
      <h2 className="text-lg font-bold mb-4">News</h2>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-14 h-14 text-loc-muted mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" />
        </svg>
        <h3 className="text-base font-semibold text-loc-muted mb-1">Coming Soon</h3>
        <p className="text-sm text-loc-muted/70 max-w-[250px]">
          League news and updates will appear here as the season progresses.
        </p>
      </div>
    </div>
  );
}
