import polka from 'polka';
import compression from '@polka/compression';
import { handler } from './build/handler.js';

polka()
	.use(compression())
	.use(handler)
	.listen(3000, () => {
		console.log('Running on http://localhost:3000');
	});