import { GitHub, generateState } from "arctic";
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "$env/static/private";
import { redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";

export const GET = async ({ locals, url, cookies }) => {
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        console.error('GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is not set');
        redirect(302, "/");
    }
    const github = new GitHub(
        GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET
    );

	const state = generateState();
	const redirectUrl = await github.createAuthorizationURL(state);

	cookies.set("github_oauth_state", state, {
		path: "/",
		secure: !dev,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	redirect(302, redirectUrl.toString());
};