export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'inbox' | 'planned' | 'in_progress' | 'waiting' | 'completed' | 'cancelled';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  projectId?: string;
  category: string;
  tags: string[];
  subtasks: Subtask[];
  estimatedTime?: number; // minutes
  actualTime?: number; // minutes
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  deadline?: string; // YYYY-MM-DD
  color: string;
  budget?: number;
  currency: Currency;
  notes?: string;
  createdAt: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  target: number;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  unit: string;
  deadline?: string;
  status: 'active' | 'achieved' | 'paused';
  milestones: GoalMilestone[];
  createdAt: string;
}

export interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roleOrRelation?: string;
  avatarColor?: string;
  notes?: string;
  createdAt: string;
}

export type Currency = 'USD' | 'UZS' | 'EUR' | 'RUB';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  personId?: string;
  projectId?: string;
  createdAt: string;
}

export type DebtType = 'they_owe' | 'i_owe'; // they_owe = Мне должны, i_owe = Я должен

export type DebtStatus = 'active' | 'partially_paid' | 'paid' | 'overdue';

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  type: DebtType;
  personId: string;
  personName: string;
  totalAmount: number;
  currency: Currency;
  reason: string;
  startDate: string;
  deadlineDate: string;
  status: DebtStatus;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'task_overdue' | 'debt_deadline' | 'project_deadline' | 'goal_milestone' | 'general';
  date: string;
  read: boolean;
  link?: string;
}

export interface AppSettings {
  userName: string;
  defaultCurrency: Currency;
  dateFormat: 'DD.MM.YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
  startOfWeek: 'monday' | 'sunday';
  notificationsEnabled: boolean;
  theme: 'dark';
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
}
