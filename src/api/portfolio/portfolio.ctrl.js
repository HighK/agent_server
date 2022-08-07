import db from '../../mysql_db';

export const list = async ctx => {
  const { user, page = 1 } = ctx.params;
  console.log('user', user);
  try {
    await db
      .promise()
      .query(
        `SELECT uri, title, pid FROM service_sc.partner_portfolio WHERE partnerId=UNHEX(?) ORDER BY create_time DESC LIMIT ?, ?`,
        [user, page == 1 ? page - 1 : (page - 1) * 10, 10],
      )
      .then(([rows, fields]) => {
        ctx.body = rows;
      });
  } catch (e) {
    ctx.throw(e);
  }
};

export const upload = async ctx => {
  const { file } = ctx.req;
  if (!file) {
    ctx.status = 503;
  }

  ctx.body = file.location;

  ctx.status = 200;
};

export const write = async ctx => {
  const { title, description, file } = ctx.request.body;

  try {
    await db
      .promise()
      .query(
        `INSERT INTO service_sc.partner_portfolio (partnerId, uri, title, description) VALUES (UNHEX(?) ,?, ?, ?)`,
        [ctx.state.user._id, file, title, description],
      );
  } catch (e) {
    ctx.throw(e);
  }

  ctx.status = 200;
};

export const read = async ctx => {
  const { user, id } = ctx.parmas;
  try {
    await db
      .promise()
      .query(`SELECT FROM service_sc.partner_portfolio WHERE UNHEX(?)`, [user]);
  } catch (e) {
    ctx.throw(e);
  }
};

export const update = ctx => {
  const { userId, id } = ctx.parmas;
};

export const remove = ctx => {
  const { userId, id } = ctx.parmas;
};
