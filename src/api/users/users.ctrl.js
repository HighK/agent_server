import db from '../../mysql_db';

export const checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state;
  if (post.user._id.toString() !== user._id) {
    ctx.status = 403;
    return;
  }
  return next();
};

export const getUserById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ctx.state.admin) {
    if (ctx.state.user._id !== id) {
      ctx.status = 403;
      return;
    }
  }

  await db
    .promise()
    .query(
      `SELECT username, account, country, email, phone_number FROM service_sc.partner_user WHERE uid=unhex(REPLACE(?, '-', ''))`,
      [id],
    )
    .then(([rows, field]) => {
      ctx.state.post = rows[0];
      return next();
    });
};

export const list = async ctx => {
  const page = 1;
  await db
    .promise()
    .query(
      `SELECT HEX(uid) AS uid, username, email FROM service_sc.partner_user ORDER BY create_time DESC LIMIT ${page *
        10 -
        10}, ${page * 10}`,
    )
    .then(([rows, field]) => {
      console.log(rows);
      let list = [];

      for (let i = 0; i < rows.length; i++) {
        const { uid, username, email } = rows[i];
        list.push({ uid, name: username, email });
      }

      ctx.body = list;
      console.log(list);
      ctx.status = 200;
    });
};

export const update = async ctx => {
  const { phone_number, account, country } = ctx.request.body;
  console.log(ctx.state.user._id, phone_number, account, country);

  await db
    .promise()
    .query(
      `UPDATE partner_user SET phone_number=?, account=?, country=? WHERE uid=unhex(REPLACE(?, '-', ''))`,
      [phone_number, account, country, ctx.state.user._id],
    );
  ctx.status = 202;
};

export const read = async ctx => {
  ctx.body = ctx.state.post;
};
