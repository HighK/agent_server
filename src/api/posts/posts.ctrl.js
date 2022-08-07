import db from '../../mysql_db';

export const checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state;
  if (post.user.uid.toString() !== user.uid) {
    ctx.status = 403;
    return;
  }
  return next();
};

export const getPostById = async (ctx, next) => {
  try {
    await db
      .promise()
      .query(`SELECT * FROM service_sc.posts WHERE post_id=?`, [ctx.params.id])
      .then(([rows, fields]) => {
        ctx.state.post = rows[0];
        return next();
      });
  } catch (err) {
    ctx.throw(500);
  }
};

export const support = async ctx => {
  const { _id, email } = ctx.state.user;
  const { id } = ctx.params;
  await db
    .promise()
    .query(`SELECT * FROM posts_supports WHERE post_id=? AND uid=UNHEX(?)`, [
      id,
      _id,
    ])
    .then(async ([rows, fields]) => {
      if (rows[0]) {
        ctx.status = 304;
        return;
      }
      await db
        .promise()
        .query(
          `INSERT INTO service_sc.posts_supports (post_id, uid, email) VALUES (?, UNHEX(?), ?)`,
          [Number(id), _id, email],
        )
        .then(() => {
          ctx.status = 200;
        });
    });
};

export const list = async ctx => {
  const { category1, category2 } = ctx.params;
  const page = parseInt(ctx.query.page || '1', 10);
  console.log(ctx.request.query);

  if (category2) {
    await db
      .promise()
      .query(
        `SELECT post_id, title, description, deadline, create_time, credit, dead, category_1, category_2 FROM service_sc.posts  WHERE category_1=? AND category_2=? ORDER BY post_id DESC LIMIT ?, ?`,
        [category1, category2, page == 1 ? page - 1 : (page - 1) * 10, 10],
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
        ctx.set('Last-Page', Math.ceil(rows[0].count / 10));
      });
  } else if (category1) {
    await db
      .promise()
      .query(
        `SELECT post_id, title, description, deadline, create_time, credit, dead, category_1, category_2 FROM service_sc.posts WHERE category_1=? ORDER BY post_id DESC LIMIT ?, ?`,
        [category1, page == 1 ? page - 1 : (page - 1) * 10, 10],
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
        ctx.set('Last-Page', Math.ceil(rows[0].count / 10));
      });
  } else {
    await db
      .promise()
      .query(
        `SELECT post_id, title, description, deadline, create_time, credit, dead, category_1, category_2 FROM service_sc.posts ORDER BY post_id desc LIMIT ?, ?`,
        [page == 1 ? page - 1 : (page - 1) * 10, 10],
      )
      .then(([rows, fields]) => {
        ctx.body = rows;
      });
    await db
      .promise()
      .query(`SELECT COUNT(*) AS count FROM service_sc.posts`)
      .then(([rows, fields]) => {
        ctx.set('Last-Page', Math.ceil(rows[0].count / 10));
      });
  }
};

export const write = async ctx => {
  const {
    title,
    body,
    description,
    credit,
    date,
    category1 = '',
    category2 = '',
  } = ctx.request.body;

  console.log(category1, category2);
  try {
    if (category2 !== '') {
      await db
        .promise()
        .query(
          `INSERT INTO posts (title, body, description, credit, deadline, category_1, category_2) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [title, body, description, credit, date, category1, category2],
        );
    } else if (category1 !== '') {
      await db
        .promise()
        .query(
          `INSERT INTO posts (title, body, description, credit, deadline, category_1) VALUES (?, ?, ?, ?, ?, ?)`,
          [title, body, description, credit, date, category1],
        );
    } else {
      await db
        .promise()
        .query(
          `INSERT INTO posts (title, body, description, credit, deadline) VALUES (?, ?, ?, ?, ?)`,
          [title, body, description, credit, date],
        );
    }
  } catch (e) {
    ctx.throw(500);
  }
  ctx.status = 204;
};

export const update = async ctx => {
  const { id } = ctx.params;
  const {
    title,
    body,
    description,
    credit,
    deadline,
    category1,
    category2,
  } = ctx.request.body;

  await db.query(
    `UPDATE posts title=?, body=?, description=?, credit=?, deadline=?, category_1=?, category_2=? WHERE post_id=?`,
    [
      title,
      body,
      description,
      credit,
      deadline,
      category1,
      category2,
      Number(id),
    ],
  );
};

export const remove = async ctx => {
  const { id } = ctx.params;

  await db.promise().query(`DELETE FROM posts WHERE post_id=${Number(id)}`);

  ctx.status = 202;
};

export const dead = async ctx => {
  const { id } = ctx.params;
  await db
    .promise()
    .query(`UPDATE service_sc.posts SET dead = 1 WHERE post_id=${Number(id)}`);

  ctx.status = 202;
};

export const unDead = async ctx => {
  const { id } = ctx.params;
  await db
    .promise()
    .query(`UPDATE service_sc.posts SET dead = 0 WHERE post_id=${Number(id)}`);

  ctx.status = 202;
};

export const read = async ctx => {
  ctx.body = ctx.state.post;
};

export const imageUpload = async ctx => {
  ctx.body = { location: ctx.req.file.location };
  ctx.status = 200;
};
