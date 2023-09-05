import express from 'express';

import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

// 💡 게시글 생성 API 비즈니스 로직**
router.post('/posts', authMiddleware, async (req, res, next) => {
    // 1. 게시글을 작성하려는 클라이언트가 로그인된 사용자인지 검증합니다. >> authMiddleware 를 통해 검증함.
    const { userId } = req.user; // 이 부분은 authMiddleware 33번째 줄에서 만든 req.user 를 가져오는 것

    // 2. 게시글 생성을 위한 `title`, `content`를 **body**로 전달받습니다.
    const { title, content } = req.body;

    // 3. **Posts** 테이블에 게시글을 생성합니다.
    const post = await prisma.posts.create({
        data: {
            UserId: userId,
            title,
            content,
        }
    });
    return res.status(201).json({ data: post })
});


// 💡 게시글 전체 조회 API 비즈니스 로직**
router.get('/posts', async (req, res, next) => {

    // 1. 게시글 여러 개 조회(=findMany)
    const posts = await prisma.posts.findMany({
        select: {
            postId: true,
            title: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: { // database 정렬하는 방법
            createdAt: 'desc' // desc 는 내림차순으로 정렬하는 법 <-> asc : 오름차순
        }
    });
    return res.status(200).json({ data: posts })
});


// 💡 게시글 전체 조회 API 비즈니스 로직**
router.get('/posts/:postId', async (req, res, next) => {
    // 1. parmas 값 받아오기 (전체 조회와 차이점, postId)
    const { postId } = req.params;

    const post = await prisma.posts.findFirst({
        where: { postId: +postId },
        select: {
            postId: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true
        }
    })
    return res.status(200).json({ data: post })
})




export default router;