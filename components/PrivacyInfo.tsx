import React from "react";

interface PrivacyInfoProps {
  isDarkTheme: boolean;
}

export function PrivacyInfo({ isDarkTheme }: PrivacyInfoProps) {
  return (
    <div
      className={`p-4 rounded-xl ${isDarkTheme ? "bg-white/5" : "bg-gray-50"}`}
    >
      <h4
        className={`font-semibold mb-3 ${
          isDarkTheme ? "text-white" : "text-gray-900"
        }`}
      >
        🔒 Privacy & Data Protection
      </h4>

      <div
        className={`space-y-3 text-sm ${
          isDarkTheme ? "text-white/70" : "text-gray-600"
        }`}
      >
        <div>
          <strong className={isDarkTheme ? "text-white/90" : "text-gray-800"}>
            What we collect:
          </strong>
          <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
            <li>Anonymous usage analytics (page views, button clicks)</li>
            <li>Error reports to improve the app</li>
            <li>No personal identifiers or browsing history</li>
          </ul>
        </div>

        <div>
          <strong className={isDarkTheme ? "text-white/90" : "text-gray-800"}>
            What we don&apos;t collect:
          </strong>
          <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
            <li>Your FID, username, or cast content</li>
            <li>IP addresses or device identifiers</li>
            <li>Cross-site tracking data</li>
          </ul>
        </div>

        <div>
          <strong className={isDarkTheme ? "text-white/90" : "text-gray-800"}>
            Data retention:
          </strong>
          <p className="ml-2 mt-1">
            All data is automatically deleted after 30 days and cannot be linked
            back to you.
          </p>
        </div>

        <div>
          <strong className={isDarkTheme ? "text-white/90" : "text-gray-800"}>
            Your control:
          </strong>
          <p className="ml-2 mt-1">
            You can disable analytics at any time in the settings above.
          </p>
        </div>
      </div>

      <div
        className={`mt-4 p-3 rounded-lg ${
          isDarkTheme
            ? "bg-blue-500/10 border border-blue-500/20"
            : "bg-blue-50 border border-blue-200"
        }`}
      >
        <p
          className={`text-xs ${
            isDarkTheme ? "text-blue-300" : "text-blue-700"
          }`}
        >
          ✅ ReplyCast follows privacy-by-design principles and complies with
          GDPR, CCPA, and other privacy regulations.
        </p>
      </div>
    </div>
  );
}
