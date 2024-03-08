import { dev } from '$app/environment';
import { Lucia, TimeSpan } from 'lucia';
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql';
import { pool } from '../database';

const adapter = new NodePostgresAdapter(pool, {
    user: 'app_user',
    session: 'session'
});

export const lucia = new Lucia(adapter, {
    getSessionAttributes: (attributes) => {
        return {
            loginMethod: attributes.login_method,
        };
    },
    getUserAttributes: (attributes) => {
        return {
            name: attributes.name,
            role: attributes.role,
        };
    },
    sessionExpiresIn: new TimeSpan(30, 'd'), // no more active/idle
    sessionCookie: {
        attributes: {
            secure: !dev
        }
    }
});

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseSessionAttributes: {
            login_method: string;
        }
        DatabaseUserAttributes: {
            name: string;
            base: string;
            role: 'admin' | 'member';
        }
    }
}
