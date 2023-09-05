import express from 'express';

import UsersRouter from './users.router.js';
import PostsRouter from './posts.router.js';
import CommentsRouter from './comments.router.js'

const router = express.Router()

router.use('', [UsersRouter, PostsRouter, CommentsRouter])

export default router;