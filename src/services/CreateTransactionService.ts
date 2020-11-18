import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CreateTransactionDto {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: CreateTransactionDto): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const balance = await transactionsRepository.getBalance();
    if (type === 'outcome' && balance.total - value < 0)
      throw new AppError('Insufficient balance');

    const categoriesRepository = getRepository(Category);
    const findCategory = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });
    let newCategory: Category;
    if (!findCategory) {
      const createCategory = categoriesRepository.create({ title: category });
      newCategory = await categoriesRepository.save(createCategory);
    } else {
      newCategory = findCategory;
    }
    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id: newCategory.id,
    });
    return await transactionsRepository.save(transaction);
  }
}

export default CreateTransactionService;
