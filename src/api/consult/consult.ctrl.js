import db from '../../mysql_db';

export const checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state;
  if (post.user._id.toString() !== user._id) {
    ctx.status = 403;
    return;
  }
  return next();
};

export const getPostById = async (ctx, next) => {
  const { id } = ctx.params;
  console.log(id);
  if (!id) {
    ctx.status = 409;
    return;
  }
  try {
    await db
      .promise()
      .query(`SELECT * FROM service_sc.consults WHERE consult_id=?`, [id])
      .then(([rows, field]) => {
        if (!rows) {
          ctx.status = 404;
        }

        ctx.state.post = rows[0];
        return next();
      });
  } catch (e) {
    ctx.throw(e);
  }
};

export const list = async ctx => {
  const { page = 1 } = ctx.params;
  try {
    await db
      .promise()
      .query(
        `SELECT title, consult_id, name FROM service_sc.consults ORDER BY consult_id DESC LIMIT ?, 10`,
        [page == 1 ? page - 1 : (page - 1) * 10, 10],
      )
      .then(([rows, field]) => {
        ctx.body = rows;
      });
  } catch (e) {
    ctx.throw(e);
  }
};

export const write = async ctx => {
  const { name, phone, email, body, credit, term, title } = ctx.request.body;
  console.log(ctx.request.body);
  await db
    .promise()
    .query(
      `INSERT INTO service_sc.consults (name, body, credit, email, phone, term, title) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, body, credit, email, phone, term, title],
    );

  ctx.status = 202;
};

export const read = async ctx => {
  ctx.body = ctx.state.post;
};

export const remove = async ctx => {
  const { id } = ctx.params;
  if (!id) {
    ctx.status = 404;
    return;
  }
  try {
    await db
      .promise()
      .query(`DELETE FROM service_sc.consult_history WHERE consult_id=?`, [id]);
  } catch (e) {
    ctx.status = 404;
  }

  ctx.status = 202;
};
