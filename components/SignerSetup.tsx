import React, { useEffect, useState } from 'react';
import { User } from '@/types/types';
import { useSigner } from '@/hooks/useSigner';

interface SignerSetupProps {
  user: User;
  onSignerApproved?: (publicKey: string) => void;
}

export const SignerSetup: React.FC<SignerSetupProps> = ({ user, onSignerApproved }) => {
  const { signerState, requestSigner, checkSignerStatus, hasSigner, isRequesting, isPending } = useSigner(user);
  const [isPolling, setIsPolling] = useState(false);

  // Poll for signer approval when in pending state
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isPending && !isPolling) {
      setIsPolling(true);
      interval = setInterval(async () => {
        const status = await checkSignerStatus();
        if (status?.state === 'approved') {
          setIsPolling(false);
          onSignerApproved?.(signerState.publicKey!);
        }
      }, 3000); // Check every 3 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (!isPending) {
        setIsPolling(false);
      }
    };
  }, [isPending, checkSignerStatus, onSignerApproved, signerState.publicKey, isPolling]);

  if (hasSigner) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-3 text-green-400">
          <svg width={20} height={20} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">Signer approved! You can now reply to casts.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 border border-white/20 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
          <svg width={32} height={32} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-blue-400">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.414-6.414z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Setup Signer</h3>
        <p className="text-white/70 text-lg max-w-md mx-auto">
          To reply to casts, you need to authorize ReplyCast to post on your behalf.
        </p>
      </div>

      {signerState.error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-xl">
          <div className="text-red-400 text-sm font-medium">
            {signerState.error}
          </div>
        </div>
      )}

      {!isPending && (
        <button
          onClick={requestSigner}
          disabled={isRequesting}
          className="btn-primary w-full mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRequesting ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-spin"
              >
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
                <path d="M20.49 15A9 9 0 0 1 6.36 18.36L1 14" />
              </svg>
              Requesting Signer...
            </span>
          ) : (
            'Authorize Signer'
          )}
        </button>
      )}

      {isPending && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 text-yellow-400">
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin"
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
              <path d="M20.49 15A9 9 0 0 1 6.36 18.36L1 14" />
            </svg>
            <span className="font-semibold">Waiting for approval...</span>
          </div>
          <p className="text-white/60 text-sm">
            Please approve the signer request in Warpcast that just opened.
          </p>
          {signerState.deeplinkUrl && (
            <button
              onClick={() => window.open(signerState.deeplinkUrl!, '_blank')}
              className="btn-secondary w-full"
            >
              Open Warpcast Again
            </button>
          )}
        </div>
      )}

      <div className="mt-6 text-xs text-white/40">
        <p>This will open Warpcast to authorize posting permissions.</p>
        <p>Your keys remain secure and are only used for posting.</p>
      </div>
    </div>
  );
};