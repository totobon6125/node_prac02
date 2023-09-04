import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

/** 사용자 회원가입 API **/
router.post('/sign-up', async (req, res, next) => {
  // 1. email, password, name, age, gender, profileImage를 body로 전달받습니다.
  const { email, password, name, age, gender, profileImage } = req.body;
  
  // 2. 동일한 email을 가진 사용자가 있는지 확인합니다.
  const isExistUser = await prisma.users.findFirst({
    where: {
      email,
    },
  });

  if (isExistUser) {
    return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
  }

  // 3. Users 테이블에 email, password를 이용해 사용자를 생성합니다.
  const user = await prisma.users.create({
    data: { email, password },
  });

  // 4. UserInfos 테이블에 name, age, gender, profileImage를 이용해 사용자 정보를 생성합니다.
  const userInfo = await prisma.userInfos.create({
    data: {
      UserId: user.userId, // 생성한 유저의 userId를 바탕으로 사용자 정보를 생성합니다.
      name,
      age,
      gender: gender.toUpperCase(), // 성별을 대문자로 변환합니다.
      profileImage,
    },
  });

  return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
});

export default router;