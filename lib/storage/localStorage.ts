// Local storage utilities for managing real data without backend

import { Company, User, EmailAccount, Subscription } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  COMPANY: 'company_data',
  USERS: 'users_data',
  EMAIL_ACCOUNTS: 'email_accounts_data',
  SUBSCRIPTION: 'subscription_data',
  CURRENT_USER: 'current_user',
  ACTIVE_EMAIL: 'active_email_account'
};

// Company data management
export const CompanyStorage = {
  save: (company: Company): void => {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));
  },

  get: (): Company | null => {
    const data = localStorage.getItem(STORAGE_KEYS.COMPANY);
    return data ? JSON.parse(data) : null;
  },

  update: (updates: Partial<Company>): Company | null => {
    const company = CompanyStorage.get();
    if (!company) return null;
    
    const updated = { ...company, ...updates };
    CompanyStorage.save(updated);
    return updated;
  }
};

// Users data management
export const UsersStorage = {
  save: (users: User[]): void => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getAll: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): User | null => {
    const users = UsersStorage.getAll();
    return users.find(user => user.id === id) || null;
  },

  add: (user: User): void => {
    const users = UsersStorage.getAll();
    users.push(user);
    UsersStorage.save(users);
  },

  update: (id: string, updates: Partial<User>): User | null => {
    const users = UsersStorage.getAll();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates };
    UsersStorage.save(users);
    return users[index];
  }
};

// Email accounts data management
export const EmailAccountsStorage = {
  save: (accounts: EmailAccount[]): void => {
    localStorage.setItem(STORAGE_KEYS.EMAIL_ACCOUNTS, JSON.stringify(accounts));
  },

  getAll: (): EmailAccount[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EMAIL_ACCOUNTS);
    return data ? JSON.parse(data) : [];
  },

  getByCompanyId: (companyId: string): EmailAccount[] => {
    const accounts = EmailAccountsStorage.getAll();
    return accounts.filter(account => account.companyId === companyId);
  },

  getById: (id: string): EmailAccount | null => {
    const accounts = EmailAccountsStorage.getAll();
    return accounts.find(account => account.id === id) || null;
  },

  getByUserId: (userId: string): EmailAccount | null => {
    const accounts = EmailAccountsStorage.getAll();
    return accounts.find(account => account.userId === userId) || null;
  },

  add: (account: EmailAccount): void => {
    const accounts = EmailAccountsStorage.getAll();
    accounts.push(account);
    EmailAccountsStorage.save(accounts);
  },

  update: (id: string, updates: Partial<EmailAccount>): EmailAccount | null => {
    const accounts = EmailAccountsStorage.getAll();
    const index = accounts.findIndex(account => account.id === id);
    
    if (index === -1) return null;
    
    accounts[index] = { ...accounts[index], ...updates };
    EmailAccountsStorage.save(accounts);
    return accounts[index];
  },

  delete: (id: string): boolean => {
    const accounts = EmailAccountsStorage.getAll();
    const filteredAccounts = accounts.filter(account => account.id !== id);
    
    if (filteredAccounts.length === accounts.length) return false;
    
    EmailAccountsStorage.save(filteredAccounts);
    return true;
  }
};

// Subscription data management
export const SubscriptionStorage = {
  save: (subscription: Subscription): void => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription));
  },

  get: (): Subscription | null => {
    const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    return data ? JSON.parse(data) : null;
  },

  update: (updates: Partial<Subscription>): Subscription | null => {
    const subscription = SubscriptionStorage.get();
    if (!subscription) return null;
    
    const updated = { ...subscription, ...updates };
    SubscriptionStorage.save(updated);
    return updated;
  }
};

// Current user session management
export const SessionStorage = {
  setCurrentUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setActiveEmailAccount: (account: EmailAccount): void => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EMAIL, JSON.stringify(account));
  },

  getActiveEmailAccount: (): EmailAccount | null => {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_EMAIL);
    return data ? JSON.parse(data) : null;
  },

  clearSession: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_EMAIL);
  }
};

// Initialize default data if not exists
export const initializeDefaultData = (): void => {
  // Check if data already exists
  if (CompanyStorage.get()) return;

  // Create default company
  const defaultCompany: Company = {
    id: 'company_' + Date.now(),
    name: 'Örnek Şirket',
    domain: 'ornek-sirket.com',
    backupEmail: 'backup@ornek-sirket.com',
    plan: 'business',
    status: 'active',
    createdAt: new Date(),
    settings: {
      maxEmailAccounts: 200, // 200'lük paket
      storageLimit: 100 * 1024 * 1024 * 1024, // 100GB
      securitySettings: {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        },
        twoFactorRequired: false,
        sessionTimeout: 60
      }
    }
  };

  // Create default admin user
  const defaultUser: User = {
    id: 'user_' + Date.now(),
    email: 'admin@ornek-sirket.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    companyId: defaultCompany.id,
    status: 'active',
    lastLogin: new Date()
  };

  // Create default admin email account (kayıt sırasında oluşturulan)
  const defaultEmailAccount: EmailAccount = {
    id: 'email_' + Date.now(),
    email: 'admin@ornek-sirket.com',
    userId: defaultUser.id,
    companyId: defaultCompany.id,
    forwardingRules: [],
    storageUsed: 0,
    status: 'active'
  };

  // Create default subscription
  const defaultSubscription: Subscription = {
    id: 'sub_' + Date.now(),
    companyId: defaultCompany.id,
    plan: {
      id: 'business_200',
      name: 'business',
      price: 299,
      features: [
        { name: 'E-posta Hesapları', included: true, limit: 200 },
        { name: 'Depolama', included: true, limit: 100 },
        { name: 'Domain Desteği', included: true },
        { name: 'E-posta Yönlendirme', included: true },
        { name: '7/24 Destek', included: true }
      ],
      limits: {
        maxEmailAccounts: 200,
        storagePerAccount: 5 * 1024 * 1024 * 1024, // 5GB per account
        totalStorage: 100 * 1024 * 1024 * 1024, // 100GB total
        maxDomains: 5
      }
    },
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    usage: {
      emailsSent: 0,
      emailsReceived: 0,
      storageUsed: 0,
      activeAccounts: 1
    }
  };

  // Save all default data
  CompanyStorage.save(defaultCompany);
  UsersStorage.save([defaultUser]);
  EmailAccountsStorage.save([defaultEmailAccount]);
  SubscriptionStorage.save(defaultSubscription);
  SessionStorage.setCurrentUser(defaultUser);
  SessionStorage.setActiveEmailAccount(defaultEmailAccount);
};