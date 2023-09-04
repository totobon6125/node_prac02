import express from 'express';

import UsersRouter from './users.router.js';

const router = express.Router()

router.use('', [UsersRouter]) 

export default router;