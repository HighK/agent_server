import Router from 'koa-router';
import * as consultCtrl from './consult.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const consults = new Router();

consults.get('/', consultCtrl.list);
consults.post('/', checkLoggedIn, consultCtrl.write);
consults.get('/:id', consultCtrl.getPostById, consultCtrl.read);
consults.delete('/:id', consultCtrl.remove);

export default consults;
