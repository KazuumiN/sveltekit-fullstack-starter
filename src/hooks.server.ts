import { lucia } from "$lib/server/auth/lucia";
import { appRoute } from "$lib/server/hono";
import type { Bindings } from "$lib/server/hono/types";
import type { Handle } from "@sveltejs/kit";
import { Hono } from "hono";

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get(lucia.sessionCookieName);
    if (!sessionId) {
        event.locals.user = null;
        event.locals.session = null;
    } else {
        const { session, user } = await lucia.validateSession(sessionId);
        if (session && session.fresh) {
            const sessionCookie = lucia.createSessionCookie(session.id);
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            });
        }
        if (!session) {
            const sessionCookie = lucia.createBlankSessionCookie();
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            });
        }
        event.locals.user = user;
        event.locals.session = session;
    }

    // Hono
    if (event.url.pathname.startsWith('/hono')) {
        const Env: Bindings = {
            user: event.locals.user
        };
        const app = new Hono({ strict: false }).route('/hono', appRoute);
        return await app.fetch(event.request, Env);
    }

    return resolve(event);
};
