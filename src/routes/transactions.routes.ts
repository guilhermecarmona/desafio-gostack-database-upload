import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';
const upload = multer(uploadConfig);

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();
  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;
  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    title,
    type,
    value,
    category,
  });
  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(request.params.id);
  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.array('files'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();
    const files = request.files as Express.Multer.File[];
    const transactions = await importTransactionsService.execute(
      files.map(file => file.filename),
    );
    return response.json(transactions);
  },
);

export default transactionsRouter;
