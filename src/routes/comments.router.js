import express from 'express';

import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();


// 💡 댓글 생성 API 비즈니스 로직**
router.post('/posts/:postId/comments', authMiddleware, async (req, res, next) => {
    // 1. 댓글을 작성하려는 클라이언트가 로그인된 사용자인지 검증합니다.
    const { userId } = req.user;

    // 2. 게시물을 특정하기 위한 `postId`를 **Path Parameters**로 전달받습니다.
    const { postId } = req.params;

    // 3. 댓글 생성을 위한 `content`를 **body**로 전달받습니다.
    const { content } = req.body;

    // 3.1 게시글(post)가 존재하는 지 확인
    const post = await prisma.posts.findFirst({ where: { postId: +postId } });
    if (!post) {
        return res.status(404).json({ errMsg: '게시글이 존재하지 않습니다.' });
    }

    // 4. **Comments** 테이블에 댓글을 생성합니다.
    const comments = await prisma.comments.create({
        data: {
            content,
            UserId: +userId,
            PostId: +postId
        }
    });
    return res.status(201).json({ data: comments });
})


// 💡 댓글 조회 API 비즈니스 로직**
router.get('/posts/:postId/comments', async (req, res, next) => {

    // 1. 누구나 조회할 수 있기 때문에 '인증' 이 필요 없음
    const { postId } = req.params;

    // 2. 게시글(post)가 존재하는 지 확인
    const post = await prisma.posts.findFirst({ where: { postId: +postId } });
    if (!post) {
        return res.status(404).json({ errMsg: '게시글이 존재하지 않습니다.' });
    }

    // 4. **Comments** 테이블에 댓글을 생성합니다.
    const comments = await prisma.comments.findMany({
        where: { PostId: +postId },
        orderBy: {  createdAt: 'desc'}
    });
    return res.status(201).json({ data: comments });
})



export default router;