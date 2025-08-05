export interface Transaction {
  id: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  category: TransactionCategory;
  reference?: string;
}

export enum TransactionCategory {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
  COST_OF_GOODS_SOLD = 'cost_of_goods_sold'
}

export enum AccountType {
  CURRENT_ASSET = 'current_asset',
  FIXED_ASSET = 'fixed_asset',
  CURRENT_LIABILITY = 'current_liability',
  LONG_TERM_LIABILITY = 'long_term_liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
  COST_OF_GOODS_SOLD = 'cost_of_goods_sold'
}

export interface Account {
  name: string;
  type: AccountType;
  balance: number;
}

export interface BalanceSheetData {
  assets: {
    currentAssets: Account[];
    fixedAssets: Account[];
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: Account[];
    longTermLiabilities: Account[];
    totalLiabilities: number;
  };
  equity: {
    equityAccounts: Account[];
    totalEquity: number;
  };
}

export interface TradingAccountData {
  sales: number;
  costOfGoodsSold: number;
  grossProfit: number;
}

export interface ProfitLossData {
  grossProfit: number;
  operatingExpenses: Account[];
  totalExpenses: number;
  netProfit: number;
}

export interface DashboardMetrics {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  netProfit: number;
  grossProfit: number;
  totalTransactions: number;
}
