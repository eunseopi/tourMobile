import type { SessionMe } from "src/api/users";

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
    user: SessionMe | null;
    status: AuthStatus;
}

export type AuthAction = 
| { type: "BOOT_START" }
| { type: "BOOT_SUCCESS"; payload: SessionMe }
| { type: "BOOT_FAIL" }
| { type: "SIGN_OUT" };

