export interface User {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  custodyAddress?: string;
  verifications?: string[];
  signerPublicKey?: string;
}

export interface SignerRequest {
  publicKey: string;
  requestFid: number;
  signature: string;
  deadline: number;
}

export interface CreateSignerRequest {
  requestFid: number;
  deadline: number;
  signature: string;
}

export interface SignerRequestResponse {
  result: {
    signerRequest: {
      token: string;
      deeplinkUrl: string;
      publicKey: string;
      deadline: number;
      requestFid: number;
      signature: string;
      state: 'pending' | 'approved' | 'revoked';
    };
  };
}

export interface SignerRequestStatus {
  result: {
    signerRequest: {
      token: string;
      publicKey: string;
      deadline: number;
      requestFid: number;
      signature: string;
      state: 'pending' | 'approved' | 'revoked';
      userFid?: number;
    };
  };
}

export interface SignerState {
  publicKey: string | null;
  status: 'idle' | 'requesting' | 'pending' | 'approved' | 'revoked';
  token: string | null;
  deeplinkUrl: string | null;
  error: string | null;
}