import { Hono } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import { object, string } from 'valibot';
import type { Bindings } from '../types';

const app = new Hono<{ Bindings: Bindings }>();
export const helloRoute = app
    .get(
        '/',
        async (c) => {
            const user = c.env.user;
            if (!user) {
                return c.json({ message: "I don't know you" });
            }
            return c.json({ message: `Hello, ${user.name}!` });
        }
    )
    .post(
        '/',
        vValidator(
            'json',
            object({
                name: string()
            })
        ),

        async (c) => {
            let { name } = c.req.valid('json');
            return c.json({ message: `Hello, ${name}!` });
        }
    );
