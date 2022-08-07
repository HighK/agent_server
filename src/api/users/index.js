import Router from 'koa-router';
import * as usersCtrl from './users.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const users = new Router();
users.post('/', usersCtrl.list);
users.get('/support', usersCtrl.list);
const user = new Router(); // /api/users/:id

user.get('/', checkLoggedIn, usersCtrl.read);
users.patch('/', checkLoggedIn, usersCtrl.update);

users.use('/:id', usersCtrl.getUserById, user.routes());

export default users;
