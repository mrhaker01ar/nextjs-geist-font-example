import { Transaction, Account, AccountType, BalanceSheetData, TradingAccountData, ProfitLossData, DashboardMetrics, TransactionCategory } from '@/types/bookkeeping';

export class BookkeepingService {
  private static STORAGE_KEY = 'bookkeeping_transactions';

  static getTransactions(): Transaction[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static saveTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    const existingIndex = transactions.findIndex(t => t.id === transaction.id);
    
    if (existingIndex >= 0) {
      transactions[existingIndex] = transaction;
    } else {
      transactions.push(transaction);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
  }

  static deleteTransaction(id: string): void {
    const transactions = this.getTransactions().filter(t => t.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
  }

  static calculateAccountBalances(): Map<string, number> {
    const transactions = this.getTransactions();
    const balances = new Map<string, number>();

    transactions.forEach(transaction => {
      // Debit increases the account balance
      const currentDebitBalance = balances.get(transaction.debitAccount) || 0;
      balances.set(transaction.debitAccount, currentDebitBalance + transaction.amount);

      // Credit decreases the account balance (or increases if it's a liability/equity/revenue)
      const currentCreditBalance = balances.get(transaction.creditAccount) || 0;
      balances.set(transaction.creditAccount, currentCreditBalance - transaction.amount);
    });

    return balances;
  }

  static getBalanceSheet(): BalanceSheetData {
    const balances = this.calculateAccountBalances();
    const accounts: Account[] = [];

    balances.forEach((balance, accountName) => {
      const accountType = this.getAccountType(accountName);
      accounts.push({ name: accountName, type: accountType, balance });
    });

    const currentAssets = accounts.filter(a => a.type === AccountType.CURRENT_ASSET);
    const fixedAssets = accounts.filter(a => a.type === AccountType.FIXED_ASSET);
    const currentLiabilities = accounts.filter(a => a.type === AccountType.CURRENT_LIABILITY);
    const longTermLiabilities = accounts.filter(a => a.type === AccountType.LONG_TERM_LIABILITY);
    const equityAccounts = accounts.filter(a => a.type === AccountType.EQUITY);

    const totalAssets = [...currentAssets, ...fixedAssets].reduce((sum, a) => sum + Math.abs(a.balance), 0);
    const totalLiabilities = [...currentLiabilities, ...longTermLiabilities].reduce((sum, a) => sum + Math.abs(a.balance), 0);
    const totalEquity = equityAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);

    return {
      assets: { currentAssets, fixedAssets, totalAssets },
      liabilities: { currentLiabilities, longTermLiabilities, totalLiabilities },
      equity: { equityAccounts, totalEquity }
    };
  }

  static getTradingAccount(): TradingAccountData {
    const transactions = this.getTransactions();
    
    const sales = transactions
      .filter(t => t.category === TransactionCategory.REVENUE)
      .reduce((sum, t) => sum + t.amount, 0);

    const costOfGoodsSold = transactions
      .filter(t => t.category === TransactionCategory.COST_OF_GOODS_SOLD)
      .reduce((sum, t) => sum + t.amount, 0);

    const grossProfit = sales - costOfGoodsSold;

    return { sales, costOfGoodsSold, grossProfit };
  }

  static getProfitLoss(): ProfitLossData {
    const tradingAccount = this.getTradingAccount();
    const balances = this.calculateAccountBalances();
    const operatingExpenses: Account[] = [];

    balances.forEach((balance, accountName) => {
      const accountType = this.getAccountType(accountName);
      if (accountType === AccountType.EXPENSE) {
        operatingExpenses.push({ name: accountName, type: accountType, balance: Math.abs(balance) });
      }
    });

    const totalExpenses = operatingExpenses.reduce((sum, a) => sum + a.balance, 0);
    const netProfit = tradingAccount.grossProfit - totalExpenses;

    return {
      grossProfit: tradingAccount.grossProfit,
      operatingExpenses,
      totalExpenses,
      netProfit
    };
  }

  static getDashboardMetrics(): DashboardMetrics {
    const balanceSheet = this.getBalanceSheet();
    const profitLoss = this.getProfitLoss();
    const tradingAccount = this.getTradingAccount();
    const transactions = this.getTransactions();

    return {
      totalAssets: balanceSheet.assets.totalAssets,
      totalLiabilities: balanceSheet.liabilities.totalLiabilities,
      totalEquity: balanceSheet.equity.totalEquity,
      netProfit: profitLoss.netProfit,
      grossProfit: tradingAccount.grossProfit,
      totalTransactions: transactions.length
    };
  }

  private static getAccountType(accountName: string): AccountType {
    const name = accountName.toLowerCase();
    
    if (name.includes('cash') || name.includes('bank') || name.includes('receivable') || name.includes('inventory')) {
      return AccountType.CURRENT_ASSET;
    }
    if (name.includes('equipment') || name.includes('building') || name.includes('land') || name.includes('furniture')) {
      return AccountType.FIXED_ASSET;
    }
    if (name.includes('payable') || name.includes('accrued') || name.includes('short')) {
      return AccountType.CURRENT_LIABILITY;
    }
    if (name.includes('loan') || name.includes('mortgage') || name.includes('bond')) {
      return AccountType.LONG_TERM_LIABILITY;
    }
    if (name.includes('capital') || name.includes('equity') || name.includes('retained')) {
      return AccountType.EQUITY;
    }
    if (name.includes('sales') || name.includes('revenue') || name.includes('income')) {
      return AccountType.REVENUE;
    }
    if (name.includes('cost') || name.includes('cogs')) {
      return AccountType.COST_OF_GOODS_SOLD;
    }
    
    return AccountType.EXPENSE;
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
