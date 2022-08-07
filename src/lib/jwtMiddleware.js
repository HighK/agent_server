import jwt from 'jsonwebtoken';
import db from '../mysql_db';

const generateToken = async (uid, email) => {
  const token = jwt.sign(
    // 첫번째 파라미터엔 토큰 안에 집어넣고 싶은 데이터를 넣습니다
    {
      _id: uid,
      email: email,
    },
    process.env.JWT_SECRET, // 두번째 파라미터에는 JWT 암호를 넣습니다
    {
      expiresIn: '7d', // 7일동안 유효함
    },
  );
  return token;
};

const jwtMiddleware = async (ctx, next) => {
  const token = ctx.cookies.get('access_token');
  if (!token) return next(); // 토큰이 없음
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.admin === 1) {
      console.log('!decoded.isAdmin' + decoded.admin);
      console.log(decoded._id);
      ctx.state.admin = {
        _id: decoded._id.replace(/-/gm, ''),
        email: decoded.email,
      };
    } else {
      ctx.state.user = {
        _id: decoded._id.replace(/-/gm, ''),
        email: decoded.email,
      };
    }

    // 토큰 3.5일 미만 남으면 재발급
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
      await db
        .promise()
        .query(`SELECT uid, email FROM partnert_user WHERE email=?`, [email])
        .then(async ([rows, fields]) => {
          const { email, uid } = rows[0];
          const token = await generateToken(uid, email);
          ctx.cookies.set('access_token', token, {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
            httpOnly: true,
          });
        });
    }

    return next();
  } catch (e) {
    console.log(e);
    // 토큰 검증 실패
    return next();
  }
};

export default jwtMiddleware;
