import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// 💡사용자 회원가입 API
router.post('/sign-up', async (req, res, next) => {
  try {
    // throw new Error('에러처리 미들웨어 테스트 용 입니다');
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
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword
      },
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
  } catch (err) {
    next(err);
  }
});



// 💡로그인 API 비즈니스 로직
router.post('/sign-in', async (req, res, next) => {
  // 1. `email`, `password`를 **body**로 전달받습니다.
  const { email, password } = req.body;

  // 2. 전달 받은 `email`에 해당하는 사용자가 있는지 확인합니다.
  const user = await prisma.users.findFirst({ where: { email } });
  if (!user) {

    return res.status(401).json({ message: '존재하지 않는 이메일 입니다.' });
  };

  // 3. 전달 받은 `password`와 데이터베이스의 저장된 `password`를 bcrypt를 이용해 검증합니다.
  const result = bcrypt.compare(password, user.password);
  if (!result) {

    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다' });
  }

  // 4. 로그인에 성공한다면, 사용자에게 JWT를 발급합니다.
  const token = jwt.sign(
    {
      userId: user.userId
    },
    process.env.key,
  )
  res.cookie('authorization', `Bearer ${token}`);

  return res.status(200).json({ message: '로그인 성공!!' });
})


// 사용자 조회 API
router.get('/users', authMiddleware, async (req, res, next) => {
  // 1. 클라이언트가 **로그인된 사용자인지 검증**합니다. >> auth.middleware.js 에서 확인하게 함.
  const { userId } = req.user;  // >> authMiddleware 의 33번 째 줄에서 req.user 에 user 정보를 할당함. 그걸 사용하는 거.


  // 2. 사용자를 조회할 때, 1:1 관계를 맺고 있는 **Users**와 **UserInfos** 테이블을 조회합니다.
  const user = await prisma.users.findFirst({
    where: { userId: +userId },

    // 특정 컬럼만 조회하는 파라미터
    select: {
      userId: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      UserInfos: { // 대문자로 사용하면 UserInfos table 이 함께 조회되는 join 문법을 사용하는 거.
        select: {
          name: true,
          age: true,
          gender: true,
          profileImage: true
        }
      }
    }
  });

  // 3. 조회한 사용자의 상세한 정보를 클라이언트에게 반환합니다.
  return res.status(200).json({ data: user });
})


export default router;