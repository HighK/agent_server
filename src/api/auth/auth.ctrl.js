import db from '../../mysql_db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import uuidParse from 'uuid-parse';

const hashPassword = async password => {
  return await bcrypt.hash(password, 10).then(res => res);
};

const checkPassword = async (lPassword, hPassword) => {
  hashPassword(lPassword).then(a => console.log(a));
  const result = await bcrypt.compare(lPassword, hPassword);
  console.log(lPassword, hPassword);
  return result; // true / false
};

const generateToken = (uid, email, mode = 0) => {
  console.log('Gentoken: ', uid, email);
  const token =
    mode === 0
      ? jwt.sign(
          // 첫번째 파라미터엔 토큰 안에 집어넣고 싶은 데이터를 넣습니다
          {
            _id: uid,
            email: email,
          },
          process.env.JWT_SECRET, // 두번째 파라미터에는 JWT 암호를 넣습니다
          {
            expiresIn: '7d', // 7일동안 유효함
          },
        )
      : jwt.sign(
          // 첫번째 파라미터엔 토큰 안에 집어넣고 싶은 데이터를 넣습니다
          {
            _id: uid,
            email: email,
            admin: 1,
          },
          process.env.JWT_SECRET, // 두번째 파라미터에는 JWT 암호를 넣습니다
          {
            expiresIn: '7d', // 7일동안 유효함
          },
        );
  return token;
};

const consumerLoginQuery = async (email, lPassword) => {
  return await db
    .promise()
    .query(
      `SELECT email, password, username, uid FROM service_sc.consult_user WHERE email=?`,
      [email],
    )
    .then(async ([rows, fields]) => {
      try {
        const { email, password, username, uid } = rows[0];
        const result = await checkPassword(lPassword, password);
        if (rows[0]) {
          if (result) {
            return [email, username, uuidParse.unparse(uid)];
          }
          // console.log(rows[0]);
          else {
            console.log('비밀번호 틀림');
            return 0;
          }
        }
      } catch (e) {
        console.log('계정 없음');
        return 0;
      }
    });
};

const loginQuery = async (email, lPassword) => {
  return await db
    .promise()
    .query(
      `SELECT email, password, username, uid FROM service_sc.partner_user WHERE email=?`,
      [email],
    )
    .then(async ([rows, fields]) => {
      try {
        const { email, password, username, uid } = rows[0];
        const result = await checkPassword(lPassword, password);
        if (rows[0]) {
          if (result) {
            return [email, username, uuidParse.unparse(uid)];
          }
          // console.log(rows[0]);
          else {
            console.log('비밀번호 틀림');
            return 0;
          }
        }
      } catch (e) {
        console.log('계정 없음');
        return 0;
      }
    });
};

export const register = async ctx => {
  const { email, username, password, phone } = ctx.request.body;
  console.log(email, username, password, phone);
  await db
    .promise()
    .query(
      `SELECT email, password, username, uid FROM service_sc.partner_user WHERE email=?`,
      [email],
    )
    .then(async ([rows, fields]) => {
      if (rows[0] === undefined) {
        await hashPassword(password).then(async hash => {
          await db
            .promise()
            .query(
              `INSERT INTO service_sc.partner_user (uid, email, username, password, phone_number, allowed) VALUES (UUID_TO_BIN(UUID()), ?, ?, ?, ?, 1)`,
              [email, username, hash, phone],
            );
          ctx.status = 202;
        });
      } else {
        ctx.status = 409;
      }
    });
};

export const consumerRegister = async ctx => {
  const { email, username, password, phone } = ctx.request.body;
  await db
    .promise()
    .query(
      `SELECT email, password, username, uid FROM service_sc.consult_user WHERE email=?`,
      [email],
    )
    .then(async ([rows, fields]) => {
      if (rows[0] === undefined) {
        await hashPassword(password).then(async hash => {
          await db
            .promise()
            .query(
              `INSERT INTO service_sc.consult_user (uid, email, username, password, phone) VALUES (UUID_TO_BIN(UUID()), ?, ?, ?, ?)`,
              [email, username, hash, phone],
            );
          ctx.status = 202;
        });
      } else {
        ctx.status = 409;
      }
    });
};

export const login = async ctx => {
  const { email, password } = ctx.request.body;
  if (!email || !password) {
    ctx.status = 401; // Unauthorized
    return;
  }
  await loginQuery(email, password, ctx).then(info => {
    console.log(info);
    if ((info === 0) | (info === undefined)) {
      ctx.status = 401;
      return;
    }
    const token = generateToken(info[2], email);

    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly: true,
    });

    ctx.status = 200;

    ctx.body = {
      email: info[0],
      username: info[1],
      _id: info[2],
    };
  }); // [email, username, uid]
  console.log(ctx.body);
};

export const consumerLogin = async ctx => {
  const { email, password } = ctx.request.body;
  if (!email || !password) {
    ctx.status = 401; // Unauthorized
    return;
  }
  await consumerLoginQuery(email, password).then(info => {
    console.log(info);
    if ((info === 0) | (info === undefined)) {
      ctx.status = 401;
      return;
    }
    const token = generateToken(info[2], email);

    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly: true,
    });

    ctx.status = 200;

    ctx.body = {
      email: info[0],
      username: info[1],
      _id: info[2],
    };
  }); // [email, username, uid]
  console.log(ctx.body);
};

export const adminLogin = async ctx => {
  const { email, password } = ctx.request.body;
  console.log(email, password);
  if (!email || !password) {
    ctx.status = 401; // Unauthorized
    return;
  }
  const lPassword = password;
  await db
    .promise()
    .query(
      `SELECT uid, email, password FROM service_sc.admin_user WHERE email=?`,
      [email],
    )
    .then(async ([rows, fields]) => {
      const { email, password, uid } = rows[0];
      console.log(email, password);
      const result = await checkPassword(lPassword, password);
      console.log(result);
      if (rows[0]) {
        if (result) {
          ctx.body = { email, uid };
          const token = generateToken(uuidParse.unparse(uid), email, 1);
          ctx.cookies.set('access_token', token, {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
            httpOnly: true,
          });
        } else {
          ctx.status = 401;
        }
      }
    });

  console.log('ASD');
};

export const checkAdmin = async ctx => {
  console.log(ctx.state);
  const { admin } = ctx.state;
  if (!admin) {
    // 로그인중 아님
    ctx.status = 401; // Unauthorized
    return;
  }
  ctx.body = admin;
};

export const check = async ctx => {
  const { user } = ctx.state;
  console.log(user);
  if (!user) {
    // 로그인중 아님
    ctx.status = 401; // Unauthorized
    return;
  }
  ctx.body = user;
};

export const logout = async ctx => {
  ctx.cookies.set('access_token');
  ctx.status = 204; // No Content
};
