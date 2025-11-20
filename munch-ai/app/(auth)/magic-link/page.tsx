"use client";
import { useEffect, useState } from "react";

export default function MagicLinkComplete() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.close();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
            <span className="text-xl font-bold text-white">M</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Thank you for verifying!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          You have successfully verified your sign-in. You can now close this
          tab and return to the original page.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          This tab will close automatically in {countdown} seconds...
        </p>
        <button
          onClick={() => window.close()}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-gray-900 dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-gray-900 shadow hover:bg-gray-700 dark:hover:bg-gray-200"
        >
          Close Tab
        </button>
      </div>
    </div>
  );
}
