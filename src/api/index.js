import Router from 'koa-router';
import auth from './auth';
import posts from './posts';
import upPosts from './admin/index';
import consults from './consult';
import users from './users';
import portfolio from './portfolio';

const api = new Router();

api.use('/users', users.routes());
api.use('/posts', posts.routes());
api.use('/auth', auth.routes());
api.use('/upPosts', upPosts.routes());
api.use('/consults', consults.routes());
api.use('/portfolio', portfolio.routes());

// 라우터를 내보냅니다.
export default api;
