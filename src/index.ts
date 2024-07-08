import { Hono } from 'hono'
import { userRouter } from './router/userRouter'
import { postRouter } from './router/postRouter'
import { tagRouter } from './router/tagRouter'
import { cors } from 'hono/cors'


// const app = new Hono<{
//     Bindings: {
//         DATABASE_URL: string;
//         JWT_SECRET: string;
//     };
//     Variables: {
//         userId: string;
//     };
// }>();

const app = new Hono();
app.use(cors())

app.get('/', (c) => c.text('You server is running! Check backend routes .'));

app.route('/api/v1/users', userRouter)
app.route('/api/v1/posts', postRouter)
app.route('/api/v1/tags', tagRouter)

export default app
