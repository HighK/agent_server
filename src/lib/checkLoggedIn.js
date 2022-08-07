const checkLoggedIn = (ctx, next) => {
  if (!(ctx.state.user || ctx.state.admin)) {
    ctx.status = 401;
  }
  return next();
};

export default checkLoggedIn;
