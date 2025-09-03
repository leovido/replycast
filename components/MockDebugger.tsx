import React, { useState } from "react";
import { checkMockEnvironment, forceEnableMocks } from "@/utils/envChecker";

interface MockDebuggerProps {
  isVisible?: boolean;
}

export function MockDebugger({ isVisible = false }: MockDebuggerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [envInfo, setEnvInfo] = useState<any>(null);

  const handleCheckEnvironment = () => {
    const info = checkMockEnvironment();
    setEnvInfo(info);
  };

  const handleForceEnableMocks = () => {
    forceEnableMocks();
    // Refresh the page to apply the change
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">🔧 Mock Debugger</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            {isExpanded ? "−" : "+"}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-3">
            <div>
              <button
                onClick={handleCheckEnvironment}
                className="w-full text-xs px-3 py-2 bg-blue-600 rounded hover:bg-blue-500 mb-2"
              >
                Check Environment
              </button>

              {envInfo && (
                <div className="text-xs bg-gray-700 p-2 rounded">
                  <pre>{JSON.stringify(envInfo, null, 2)}</pre>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={handleForceEnableMocks}
                className="w-full text-xs px-3 py-2 bg-green-600 rounded hover:bg-green-500"
              >
                Force Enable Mocks
              </button>
              <p className="text-xs text-gray-400 mt-1">
                This will reload the page and force mocks on
              </p>
            </div>

            <div className="text-xs text-gray-400">
              <p>💡 Set NEXT_PUBLIC_USE_MOCKS=true in .env.local</p>
              <p>🔍 Check browser console for mock logs</p>
              <p>📱 Look for &quot;Mock:&quot; prefixed messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
