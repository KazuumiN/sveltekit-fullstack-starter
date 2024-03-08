import { Hono } from 'hono';
import type { Bindings } from './types';
import { helloRoute } from './routes/hello';

const app = new Hono<{ Bindings: Bindings }>();

export const appRoute = app
    .route('/hello', helloRoute)

export type AppRoute = typeof appRoute;
