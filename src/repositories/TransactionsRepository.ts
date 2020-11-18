import { EntityRepository, getRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionsRepository = getRepository(Transaction);
    const transactions = await transactionsRepository.find();
    let income: number = 0;
    let outcome: number = 0;
    const transactionsBalanceReducer = (
      sum: number,
      currentValue: Transaction,
    ) => {
      if (currentValue.type === 'income') {
        income += Number(currentValue.value);
        return sum + Number(currentValue.value);
      } else {
        outcome += Number(currentValue.value);
        return sum - Number(currentValue.value);
      }
    };
    const total = transactions.reduce(transactionsBalanceReducer, 0);
    return {
      income,
      outcome,
      total,
    };
  }
}

export default TransactionsRepository;
