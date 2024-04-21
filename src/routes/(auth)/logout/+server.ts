import { lucia } from '$lib/server/auth/lucia.js';
import { fail, redirect } from '@sveltejs/kit';

export const GET = async ({ locals, request, cookies }) => {
    // 直前のURLを取得
    const referer = request.headers.get('referer');
    if (!locals.session) {
        redirect(302, referer || "/");
    }
    await lucia.invalidateSession(locals.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes
    });
    redirect(302, referer || "/");
}