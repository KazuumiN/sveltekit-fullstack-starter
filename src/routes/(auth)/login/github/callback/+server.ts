import { GitHub, OAuth2RequestError, generateState } from "arctic";
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "$env/static/private";
import { redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { lucia } from "$lib/server/auth/lucia.js";
import { generateId } from "lucia";
import db from "$lib/server/database/index.js";

export const GET = async ({ locals, url, cookies }) => {
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        console.error('GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is not set');
        redirect(302, "/");
    }
    const github = new GitHub(
        GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET
    );
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = cookies.get("github_oauth_state") ?? null;

    if (!code || !state || !storedState || state !== storedState) {
        return new Response(null, {
            status: 400
        });
    }

    try {
        const tokens = await github.validateAuthorizationCode(code);
        const githubUserResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`
            }
        });
        const githubUser: GitHubUser = await githubUserResponse.json();

        // Replace this with your own DB client.
        const existingUser = await db.selectFrom('key').where('provider', '=', 'github').where('sub', '=', String(githubUser.id)).select('userId').executeTakeFirst();

        if (existingUser) {
            const session = await lucia.createSession(existingUser.userId, {
                login_method: 'github'
            });
            const sessionCookie = lucia.createSessionCookie(session.id);
            cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            });
        } else {
            const userId = generateId(15);

            await db.transaction().execute(async (trx) => {
                await trx.insertInto('appUser').values({
                    id: userId,
                    name: githubUser.login,
                    role: 'member'
                }).execute();
                await trx.insertInto('key').values({
                    userId,
                    provider: 'github',
                    sub: String(githubUser.id)
                }).execute();
            })

            const session = await lucia.createSession(userId, {
                login_method: 'github'
            });
            const sessionCookie = lucia.createSessionCookie(session.id);
            cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            });
        }
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/"
            }
        });
    } catch (e) {
        if (e instanceof OAuth2RequestError) {
            return new Response(null, {
                status: 400
            });
        }
        return new Response(null, {
            status: 500
        });
    }
}

interface GitHubUser {
    id: number;
    login: string;
}