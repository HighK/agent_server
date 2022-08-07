import Router from 'koa-router';
import * as portfolioCtrl from './portfolio.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';
import { portfolioUpload } from '../../s3';

const portfolios = new Router();

portfolios.post('/write', portfolioCtrl.write);

portfolios.post(
  '/:user',
  portfolioUpload.single('file_name'),
  portfolioCtrl.upload,
);

// portfolios.post('/:user', s3.upload.single('file_name'), portfolioCtrl.upload);
portfolios.get('/:user', portfolioCtrl.list);

const portfolio = new Router(); // /api/:user/:id
portfolio.get('/', portfolioCtrl.read);
// portfolio.delete('/', portfolioCtrl.delete);
portfolio.patch('/', portfolioCtrl.update);
// portfolios.use('/:id', postsCtrl.getPostById, portfolio.routes());

export default portfolios;
