import Router from 'koa-router';
import * as authCtrl from './auth.ctrl';

const auth = new Router();

auth.post('/register', authCtrl.register);
auth.post('/login', authCtrl.login);
auth.post('/adminLogin', authCtrl.adminLogin);
auth.post('/consumerRegister', authCtrl.consumerRegister);
auth.post('/consumerLogin', authCtrl.consumerLogin);
auth.get('/check', authCtrl.check);
auth.get('/checkAdmin', authCtrl.checkAdmin);
auth.post('/logout', authCtrl.logout);

export default auth;
