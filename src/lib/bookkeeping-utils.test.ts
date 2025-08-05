import { BookkeepingService } from './bookkeeping-utils';
import { Transaction, TransactionCategory } from '@/types/bookkeeping';

describe('BookkeepingService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should add a transaction and update metrics correctly', () => {
    const transaction: Transaction = {
      id: 'test-1',
      date: '2024-01-01',
      description: 'Test Sale',
      debitAccount: 'Cash',
      creditAccount: 'Sales Revenue',
      amount: 1000,
      category: TransactionCategory.REVENUE,
      reference: 'INV-001'
    };

    BookkeepingService.saveTransaction(transaction);

    const transactions = BookkeepingService.getTransactions();
    expect(transactions.length).toBe(1);
    expect(transactions[0].description).toBe('Test Sale');

    const balanceSheet = BookkeepingService.getBalanceSheet();
    expect(balanceSheet.assets.currentAssets.find(a => a.name === 'Cash')?.balance).toBe(1000);
    expect(balanceSheet.equity.equityAccounts.length).toBe(0);

    const tradingAccount = BookkeepingService.getTradingAccount();
    expect(tradingAccount.sales).toBe(1000);
    expect(tradingAccount.grossProfit).toBe(1000);

    const profitLoss = BookkeepingService.getProfitLoss();
    expect(profitLoss.grossProfit).toBe(1000);
    expect(profitLoss.netProfit).toBe(1000);

    const metrics = BookkeepingService.getDashboardMetrics();
    expect(metrics.totalAssets).toBeGreaterThan(0);
    expect(metrics.grossProfit).toBe(1000);
  });

  it('should delete a transaction', () => {
    const transaction: Transaction = {
      id: 'test-2',
      date: '2024-01-02',
      description: 'Test Expense',
      debitAccount: 'Rent Expense',
      creditAccount: 'Cash',
      amount: 500,
      category: TransactionCategory.EXPENSE,
      reference: 'BILL-001'
    };

    BookkeepingService.saveTransaction(transaction);
    expect(BookkeepingService.getTransactions().length).toBe(1);

    BookkeepingService.deleteTransaction('test-2');
    expect(BookkeepingService.getTransactions().length).toBe(0);
  });
});
