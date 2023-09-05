import express from 'express';

import UsersRouter from './users.router.js';
import PostsRouter from './posts.router.js';

const router = express.Router()

router.use('', [UsersRouter, PostsRouter])

export default router;