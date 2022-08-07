import Router from 'koa-router';
import * as postsCtrl from './posts.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';
import { imageUpload } from '../../s3';

const posts = new Router();

posts.get('/cat/:category1/:category2', postsCtrl.list);
posts.get('/cat/:category1', postsCtrl.list);

posts.post('/undead/:id', postsCtrl.unDead);
posts.post('/dead/:id', postsCtrl.dead);
posts.get('/', postsCtrl.list);
posts.post('/', postsCtrl.write);
posts.post('/image', imageUpload.single('file'), postsCtrl.imageUpload);

const post = new Router(); // /api/posts/:id
posts.get('/support/:id', postsCtrl.support);
post.get('/', postsCtrl.read);
post.delete('/', postsCtrl.remove);
post.patch('/', checkLoggedIn, postsCtrl.checkOwnPost, postsCtrl.update);

posts.use('/:id', postsCtrl.getPostById, post.routes());

export default posts;
