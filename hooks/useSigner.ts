import { useState, useCallback, useEffect } from 'react';
import { SignerState, User } from '@/types/types';

export const useSigner = (user: User | null) => {
  const [signerState, setSignerState] = useState<SignerState>({
    publicKey: null,
    status: 'idle',
    token: null,
    deeplinkUrl: null,
    error: null,
  });

  // Check if user already has a signer
  useEffect(() => {
    if (user?.signerPublicKey) {
      setSignerState(prev => ({
        ...prev,
        publicKey: user.signerPublicKey!,
        status: 'approved'
      }));
    }
  }, [user]);

  const requestSigner = useCallback(async () => {
    if (!user) {
      setSignerState(prev => ({ ...prev, error: 'No user found' }));
      return;
    }

    setSignerState(prev => ({ ...prev, status: 'requesting', error: null }));

    try {
      const response = await fetch('/api/signer/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fid: user.fid,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to request signer: ${response.status}`);
      }

      const data = await response.json();
      
      setSignerState(prev => ({
        ...prev,
        status: 'pending',
        token: data.token,
        deeplinkUrl: data.deeplinkUrl,
        publicKey: data.publicKey,
      }));

      // Open deeplink to approve signer
      if (data.deeplinkUrl) {
        window.open(data.deeplinkUrl, '_blank');
      }

      return data;
    } catch (error) {
      console.error('Error requesting signer:', error);
      setSignerState(prev => ({
        ...prev,
        status: 'idle',
        error: error instanceof Error ? error.message : 'Failed to request signer'
      }));
    }
  }, [user]);

  const checkSignerStatus = useCallback(async () => {
    if (!signerState.token) {
      return;
    }

    try {
      const response = await fetch(`/api/signer/status?token=${signerState.token}`);
      
      if (!response.ok) {
        throw new Error(`Failed to check signer status: ${response.status}`);
      }

      const data = await response.json();
      
      setSignerState(prev => ({
        ...prev,
        status: data.state,
      }));

      return data;
    } catch (error) {
      console.error('Error checking signer status:', error);
      setSignerState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to check signer status'
      }));
    }
  }, [signerState.token]);

  const resetSigner = useCallback(() => {
    setSignerState({
      publicKey: null,
      status: 'idle',
      token: null,
      deeplinkUrl: null,
      error: null,
    });
  }, []);

  return {
    signerState,
    requestSigner,
    checkSignerStatus,
    resetSigner,
    hasSigner: signerState.status === 'approved' && !!signerState.publicKey,
    isRequesting: signerState.status === 'requesting',
    isPending: signerState.status === 'pending',
  };
};