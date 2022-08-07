import db from '../../mysql_db';

export const list = async ctx => {
  const { category1, category2 } = ctx.params;
  const page = parseInt(ctx.request.query.page || '1', 10);

  if (category2) {
    await db
      .promise()
      .query(
        `SELECT post_id, title, dead FROM service_sc.posts WHERE category_1=? AND category_2=? ORDER BY post_id DESC LIMIT ?, ?`,
        [category1, category2, page == 1 ? page - 1 : (page - 1) * 20, 20],
      )
      .then(([rows, fields]) => {
        ctx.body = rows;
      });
    await db
      .promise()
      .query(
        `SELECT COUNT(*) AS count FROM service_sc.posts WHERE category_1=? AND category_2=?`,
        [category1, category2],
      )
      .then(([rows, fields]) => {
        ctx.set('Last-Page', Math.ceil(rows[0].count / 20));
      });
  } else if (category1) {
    await db
      .promise()
      .query(
        `SELECT post_id, title, dead FROM service_sc.posts WHERE category_1=? ORDER BY post_id DESC LIMIT ?, ?`,
        [category1, page == 1 ? page - 1 : (page - 1) * 20, 20],
      )
      .then(([rows, fields]) => {
        ctx.body = rows;
      });
    await db
      .promise()
      .query(
        `SELECT COUNT(*) AS count FROM service_sc.posts WHERE category_1=?`,
        [category1],
      )
      .then(([rows, fields]) => {
        ctx.set('Last-Page', Math.ceil(rows[0].count / 20));
      });
  } else {
    await db
      .promise()
      .query(
        `SELECT post_id, title, dead FROM service_sc.posts ORDER BY post_id desc LIMIT ?, ?`,
        [page == 1 ? page - 1 : (page - 1) * 20, 20],
      )
      .then(([rows, fields]) => {
        ctx.body = rows;
      });
    await db
      .promise()
      .query(`SELECT COUNT(*) AS count FROM service_sc.posts`)
      .then(([rows, fields]) => {
        ctx.set('Last-Page', Math.ceil(rows[0].count / 20));
      });
  }
};

export const support = async ctx => {
  const { postId, page = 1 } = ctx.request.query;
  if (!postId) {
    ctx.status = 404;
    return;
  }
  let list = [];

  await db
    .promise()
    .query(
      `SELECT HEX(partner_user.uid) AS uid, partner_user.email, partner_user.username FROM posts_supports, partner_user WHERE posts_supports.uid=partner_user.uid AND posts_supports.post_id=? ORDER BY posts_supports.create_time DESC LIMIT ?, ?`,
      [postId, page == 1 ? page - 1 : (page - 1) * 10, 10],
    )
    .then(([rows, fields]) => {
      rows.map(({ uid, email, username }) => {
        list.push({ uid: uid, email: email, name: username });
      });
    });
  ctx.body = list;
};
