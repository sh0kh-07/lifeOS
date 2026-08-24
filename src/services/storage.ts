import {
  getInitialDebts,
  getInitialGoals,
  getInitialNotifications,
  getInitialPayments,
  getInitialPeople,
  getInitialProjects,
  getInitialSettings,
  getInitialTasks,
  getInitialTransactions,
} from '../data/demoData';
import {
  AppSettings,
  Debt,
  DebtPayment,
  Goal,
  NotificationItem,
  Person,
  Project,
  Task,
  Transaction,
} from '../types';

export const STORAGE_KEYS = {
  TASKS: 'app_tasks',
  PROJECTS: 'app_projects',
  GOALS: 'app_goals',
  PEOPLE: 'app_people',
  TRANSACTIONS: 'app_transactions',
  DEBTS: 'app_debts',
  PAYMENTS: 'app_payments',
  NOTIFICATIONS: 'app_notifications',
  SETTINGS: 'app_settings',
  VERSION: 'app_data_version',
} as const;

export const CURRENT_DATA_VERSION = '1.1.0';

// Generic safe storage helper
function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export const storage = {
  // Tasks
  loadTasks(): Task[] {
    return safeGet<Task[]>(STORAGE_KEYS.TASKS, getInitialTasks());
  },
  saveTasks(tasks: Task[]): void {
    safeSet(STORAGE_KEYS.TASKS, tasks);
  },

  // Projects
  loadProjects(): Project[] {
    return safeGet<Project[]>(STORAGE_KEYS.PROJECTS, getInitialProjects());
  },
  saveProjects(projects: Project[]): void {
    safeSet(STORAGE_KEYS.PROJECTS, projects);
  },

  // Goals
  loadGoals(): Goal[] {
    return safeGet<Goal[]>(STORAGE_KEYS.GOALS, getInitialGoals());
  },
  saveGoals(goals: Goal[]): void {
    safeSet(STORAGE_KEYS.GOALS, goals);
  },

  // People
  loadPeople(): Person[] {
    return safeGet<Person[]>(STORAGE_KEYS.PEOPLE, getInitialPeople());
  },
  savePeople(people: Person[]): void {
    safeSet(STORAGE_KEYS.PEOPLE, people);
  },

  // Transactions
  loadTransactions(): Transaction[] {
    return safeGet<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, getInitialTransactions());
  },
  saveTransactions(transactions: Transaction[]): void {
    safeSet(STORAGE_KEYS.TRANSACTIONS, transactions);
  },

  // Debts
  loadDebts(): Debt[] {
    return safeGet<Debt[]>(STORAGE_KEYS.DEBTS, getInitialDebts());
  },
  saveDebts(debts: Debt[]): void {
    safeSet(STORAGE_KEYS.DEBTS, debts);
  },

  // Debt Payments
  loadPayments(): DebtPayment[] {
    return safeGet<DebtPayment[]>(STORAGE_KEYS.PAYMENTS, getInitialPayments());
  },
  savePayments(payments: DebtPayment[]): void {
    safeSet(STORAGE_KEYS.PAYMENTS, payments);
  },

  // Notifications
  loadNotifications(): NotificationItem[] {
    return safeGet<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, getInitialNotifications());
  },
  saveNotifications(notifications: NotificationItem[]): void {
    safeSet(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  // Settings
  loadSettings(): AppSettings {
    return safeGet<AppSettings>(STORAGE_KEYS.SETTINGS, getInitialSettings());
  },
  saveSettings(settings: AppSettings): void {
    safeSet(STORAGE_KEYS.SETTINGS, settings);
  },

  // Initialize first launch
  initializeFirstLaunch(): void {
    const version = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (!version || version !== CURRENT_DATA_VERSION) {
      this.resetToDemoData();
      localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_DATA_VERSION);
    }
  },

  // Reset to full demo data
  resetToDemoData(): void {
    this.saveTasks(getInitialTasks());
    this.saveProjects(getInitialProjects());
    this.saveGoals(getInitialGoals());
    this.savePeople(getInitialPeople());
    this.saveTransactions(getInitialTransactions());
    this.saveDebts(getInitialDebts());
    this.savePayments(getInitialPayments());
    this.saveNotifications(getInitialNotifications());
    this.saveSettings(getInitialSettings());
  },

  // Export all data as JSON string
  exportAllData(): string {
    const payload = {
      version: CURRENT_DATA_VERSION,
      exportedAt: new Date().toISOString(),
      tasks: this.loadTasks(),
      projects: this.loadProjects(),
      goals: this.loadGoals(),
      people: this.loadPeople(),
      transactions: this.loadTransactions(),
      debts: this.loadDebts(),
      payments: this.loadPayments(),
      notifications: this.loadNotifications(),
      settings: this.loadSettings(),
    };
    return JSON.stringify(payload, null, 2);
  },

  // Import all data from JSON string
  importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.tasks)) this.saveTasks(data.tasks);
      if (Array.isArray(data.projects)) this.saveProjects(data.projects);
      if (Array.isArray(data.goals)) this.saveGoals(data.goals);
      if (Array.isArray(data.people)) this.savePeople(data.people);
      if (Array.isArray(data.transactions)) this.saveTransactions(data.transactions);
      if (Array.isArray(data.debts)) this.saveDebts(data.debts);
      if (Array.isArray(data.payments)) this.savePayments(data.payments);
      if (Array.isArray(data.notifications)) this.saveNotifications(data.notifications);
      if (data.settings && typeof data.settings === 'object') this.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Failed to import backup data:', e);
      return false;
    }
  },

  // Clear all data (nullify completely)
  clearAllData(): void {
    this.saveTasks([]);
    this.saveProjects([]);
    this.saveGoals([]);
    this.savePeople([]);
    this.saveTransactions([]);
    this.saveDebts([]);
    this.savePayments([]);
    this.saveNotifications([]);
  },
};
