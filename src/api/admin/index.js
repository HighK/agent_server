import Router from 'koa-router';
import * as adminCtrl from './admin.ctrl';

const upPosts = new Router();

upPosts.get('/', adminCtrl.list);
upPosts.get('/support', adminCtrl.support);

export default upPosts;
