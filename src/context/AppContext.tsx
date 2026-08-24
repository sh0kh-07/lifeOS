import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../services/storage';
import {
  AppSettings,
  Currency,
  Debt,
  DebtPayment,
  Goal,
  NotificationItem,
  Person,
  Project,
  Task,
  ToastMessage,
  ToastType,
  Transaction,
  TransactionType,
} from '../types';
import { getTodayDateString, isDateOverdue, isDateToday } from '../utils/date';

interface AppContextType {
  // State
  tasks: Task[];
  projects: Project[];
  goals: Goal[];
  people: Person[];
  transactions: Transaction[];
  debts: Debt[];
  payments: DebtPayment[];
  debtPayments: DebtPayment[];
  notifications: NotificationItem[];
  settings: AppSettings;
  toasts: ToastMessage[];

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  toggleTaskSubtask: (taskId: string, subtaskId: string) => void;
  rescheduleTask: (id: string, newDate: string) => void;

  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  updateGoalAmount: (id: string, newAmount: number) => void;
  toggleGoalMilestone: (goalId: string, milestoneId: string) => void;

  // Person actions
  addPerson: (person: Omit<Person, 'id' | 'createdAt'>) => Person;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;

  // Transaction actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Debt & Payment actions
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'status'>) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  settleDebtFull: (debtId: string) => void;
  addDebtPayment: (debtId: string, amount: number, date: string, note?: string) => void;
  deleteDebtPayment: (paymentId: string) => void;

  // Calculation helpers
  getDebtPaidAmount: (debtId: string) => number;
  getDebtRemaining: (debt: Debt) => number;
  getPersonDebtsSummary: (personId: string) => { theyOwe: number; iOwe: number; currency: Currency };
  getFinancialSummary: (currency?: Currency) => {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    receivables: number;
    payables: number;
    netWorth: number;
  };
  getTodayTasks: () => Task[];
  getOverdueTasks: () => Task[];

  // Notification actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;

  // Settings & System
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetToDemoData: () => void;
  realignDatesToToday: () => void;
  clearAllData: () => void;
  importBackup: (jsonString: string) => boolean;
  exportBackup: () => string;
  showToast: (title: string, message?: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;

  // Modals state & controls
  isTaskModalOpen: boolean;
  editingTask: Task | null;
  defaultTaskDate: string;
  openTaskModal: (task?: Task | null, defaultDate?: string) => void;
  closeTaskModal: () => void;

  isTransactionModalOpen: boolean;
  editingTransaction: Transaction | null;
  defaultTxType: TransactionType;
  openTransactionModal: (tx?: Transaction | null, defaultType?: TransactionType) => void;
  closeTransactionModal: () => void;

  isDebtModalOpen: boolean;
  editingDebt: Debt | null;
  defaultDebtType: 'they_owe' | 'i_owe';
  openDebtModal: (debt?: Debt | null, type?: 'they_owe' | 'i_owe') => void;
  closeDebtModal: () => void;

  isPaymentModalOpen: boolean;
  paymentTargetDebt: Debt | null;
  openPaymentModal: (debt: Debt) => void;
  closePaymentModal: () => void;

  isProjectModalOpen: boolean;
  editingProject: Project | null;
  openProjectModal: (project?: Project | null) => void;
  closeProjectModal: () => void;

  isGoalModalOpen: boolean;
  editingGoal: Goal | null;
  openGoalModal: (goal?: Goal | null) => void;
  closeGoalModal: () => void;

  isPersonModalOpen: boolean;
  editingPerson: Person | null;
  openPersonModal: (person?: Person | null) => void;
  closePersonModal: () => void;

  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  isQuickActionOpen: boolean;
  openQuickAction: () => void;
  closeQuickAction: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize storage version and initial data if first visit
  useEffect(() => {
    storage.initializeFirstLaunch();
  }, []);

  const [tasks, setTasks] = useState<Task[]>(() => storage.loadTasks());
  const [projects, setProjects] = useState<Project[]>(() => storage.loadProjects());
  const [goals, setGoals] = useState<Goal[]>(() => storage.loadGoals());
  const [people, setPeople] = useState<Person[]>(() => storage.loadPeople());
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage.loadTransactions());
  const [debts, setDebts] = useState<Debt[]>(() => storage.loadDebts());
  const [payments, setPayments] = useState<DebtPayment[]>(() => storage.loadPayments());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => storage.loadNotifications());
  const [settings, setSettings] = useState<AppSettings>(() => storage.loadSettings());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskDate, setDefaultTaskDate] = useState<string>('');

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>('expense');

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [defaultDebtType, setDefaultDebtType] = useState<'they_owe' | 'i_owe'>('they_owe');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetDebt, setPaymentTargetDebt] = useState<Debt | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    storage.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    storage.saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    storage.saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    storage.savePeople(people);
  }, [people]);

  useEffect(() => {
    storage.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    storage.saveDebts(debts);
  }, [debts]);

  useEffect(() => {
    storage.savePayments(payments);
  }, [payments]);

  useEffect(() => {
    storage.saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  // Toast system
  const showToast = (title: string, message?: string, type: ToastType = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Task management
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: 'task-' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast('Задача создана', `"${newTask.title}" добавлена в список`, 'success');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isCompleting = updates.status === 'completed' && t.status !== 'completed';
          return {
            ...t,
            ...updates,
            updatedAt: now,
            completedAt: isCompleting ? now : updates.status !== 'completed' ? undefined : t.completedAt,
          };
        }
        return t;
      })
    );
    showToast('Изменения сохранены', undefined, 'success');
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Задача удалена', taskToDelete?.title, 'info');
  };

  const toggleTaskStatus = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const isNowCompleted = task.status !== 'completed';
    const newStatus = isNowCompleted ? 'completed' : 'in_progress';
    const now = new Date().toISOString();

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: newStatus,
              updatedAt: now,
              completedAt: isNowCompleted ? now : undefined,
            }
          : t
      )
    );

    if (isNowCompleted) {
      showToast('Задача выполнена! ✓', task.title, 'success');
    } else {
      showToast('Задача возвращена в работу', task.title, 'info');
    }
  };

  const toggleTaskSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = (t.subtasks || []).map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
          return {
            ...t,
            subtasks: updatedSubtasks,
            status: allCompleted && t.status !== 'completed' ? 'completed' : t.status,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const rescheduleTask = (id: string, newDate: string) => {
    updateTask(id, { dueDate: newDate });
    showToast('Дата задачи перенесена', `Новая дата: ${newDate}`, 'info');
  };

  // Projects
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: 'proj-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
    showToast('Проект создан', newProject.name, 'success');
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Проект обновлен', undefined, 'success');
  };

  const deleteProject = (id: string) => {
    const proj = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    // Detach project from tasks
    setTasks((prev) => prev.map((t) => (t.projectId === id ? { ...t, projectId: undefined } : t)));
    showToast('Проект удален', proj?.name, 'info');
  };

  // Goals
  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: 'goal-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [newGoal, ...prev]);
    showToast('Цель поставлена', newGoal.title, 'success');
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    showToast('Цель обновлена', undefined, 'success');
  };

  const deleteGoal = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Цель удалена', goal?.title, 'info');
  };

  const updateGoalAmount = (id: string, newAmount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const isReached = newAmount >= g.targetAmount;
          return {
            ...g,
            currentAmount: newAmount,
            status: isReached ? 'achieved' : g.status === 'achieved' ? 'active' : g.status,
          };
        }
        return g;
      })
    );
    showToast('Прогресс цели обновлен', undefined, 'success');
  };

  const toggleGoalMilestone = (goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const updatedMilestones = g.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          return { ...g, milestones: updatedMilestones };
        }
        return g;
      })
    );
  };

  // People
  const addPerson = (personData: Omit<Person, 'id' | 'createdAt'>): Person => {
    const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#6366F1'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newPerson: Person = {
      ...personData,
      avatarColor: personData.avatarColor || randomColor,
      id: 'person-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setPeople((prev) => [newPerson, ...prev]);
    showToast('Контакт добавлен', newPerson.name, 'success');
    return newPerson;
  };

  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Контакт обновлен', undefined, 'success');
  };

  const deletePerson = (id: string) => {
    const person = people.find((p) => p.id === id);
    setPeople((prev) => prev.filter((p) => p.id !== id));
    showToast('Контакт удален', person?.name, 'info');
  };

  // Transactions
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(
      txData.type === 'income' ? 'Доход записан' : 'Расход записан',
      `${txData.description || txData.category}`,
      'success'
    );
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast('Транзакция обновлена', undefined, 'success');
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Транзакция удалена', undefined, 'info');
  };

  // Debts & Payments
  const getDebtPaidAmount = (debtId: string): number => {
    return payments
      .filter((p) => p.debtId === debtId)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getDebtRemaining = (debt: Debt): number => {
    const paid = getDebtPaidAmount(debt.id);
    return Math.max(0, debt.totalAmount - paid);
  };

  const addDebt = (debtData: Omit<Debt, 'id' | 'createdAt' | 'status'>) => {
    const newDebt: Debt = {
      ...debtData,
      id: 'debt-' + Date.now(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setDebts((prev) => [newDebt, ...prev]);
    showToast(
      debtData.type === 'they_owe' ? 'Добавлен долг: мне должны' : 'Добавлен долг: я должен',
      `${debtData.personName} — ${debtData.totalAmount} ${debtData.currency}`,
      'success'
    );
  };

  const updateDebt = (id: string, updates: Partial<Debt>) => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    showToast('Данные долга обновлены', undefined, 'success');
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
    setPayments((prev) => prev.filter((p) => p.debtId !== id));
    showToast('Запись о долге удалена', undefined, 'info');
  };

  const settleDebtFull = (debtId: string) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return;
    const remaining = getDebtRemaining(debt);
    if (remaining > 0) {
      addDebtPayment(debtId, remaining, getTodayDateString(), 'Полное закрытие долга');
    } else {
      updateDebt(debtId, { status: 'paid' });
    }
  };

  const addDebtPayment = (debtId: string, amount: number, date: string, note?: string) => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return;

    const newPayment: DebtPayment = {
      id: 'pay-' + Date.now(),
      debtId,
      amount,
      date,
      note,
      createdAt: new Date().toISOString(),
    };

    const newPayments = [newPayment, ...payments];
    setPayments(newPayments);

    // Calculate new status
    const totalPaid = newPayments
      .filter((p) => p.debtId === debtId)
      .reduce((sum, p) => sum + p.amount, 0);

    let newStatus: Debt['status'] = debt.status;
    if (totalPaid >= debt.totalAmount) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      newStatus = 'partially_paid';
    }

    setDebts((prev) => prev.map((d) => (d.id === debtId ? { ...d, status: newStatus } : d)));

    showToast('Платеж успешно добавлен', `Внесено: ${amount} ${debt.currency}`, 'success');
  };

  const deleteDebtPayment = (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;

    const updatedPayments = payments.filter((p) => p.id !== paymentId);
    setPayments(updatedPayments);

    const debt = debts.find((d) => d.id === payment.debtId);
    if (debt) {
      const remainingPaid = updatedPayments
        .filter((p) => p.debtId === debt.id)
        .reduce((sum, p) => sum + p.amount, 0);

      let newStatus: Debt['status'] = 'active';
      if (remainingPaid >= debt.totalAmount) {
        newStatus = 'paid';
      } else if (remainingPaid > 0) {
        newStatus = 'partially_paid';
      }
      setDebts((prev) => prev.map((d) => (d.id === debt.id ? { ...d, status: newStatus } : d)));
    }

    showToast('Платеж удален', undefined, 'info');
  };

  const getPersonDebtsSummary = (personId: string) => {
    let theyOwe = 0;
    let iOwe = 0;
    let currency: Currency = settings.defaultCurrency;

    debts
      .filter((d) => d.personId === personId)
      .forEach((d) => {
        currency = d.currency;
        const rem = getDebtRemaining(d);
        if (d.type === 'they_owe') {
          theyOwe += rem;
        } else {
          iOwe += rem;
        }
      });

    return { theyOwe, iOwe, currency };
  };

  const getFinancialSummary = (currency: Currency = settings.defaultCurrency) => {
    const filteredTx = transactions.filter((t) => t.currency === currency);
    const totalIncome = filteredTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const filteredDebts = debts.filter((d) => d.currency === currency);
    const receivables = filteredDebts
      .filter((d) => d.type === 'they_owe')
      .reduce((sum, d) => sum + getDebtRemaining(d), 0);

    const payables = filteredDebts
      .filter((d) => d.type === 'i_owe')
      .reduce((sum, d) => sum + getDebtRemaining(d), 0);

    const netWorth = balance + receivables - payables;

    return {
      totalIncome,
      totalExpenses,
      balance,
      receivables,
      payables,
      netWorth,
    };
  };

  const getTodayTasks = () => {
    return tasks.filter((t) => isDateToday(t.dueDate));
  };

  const getOverdueTasks = () => {
    return tasks.filter(
      (t) => t.status !== 'completed' && t.status !== 'cancelled' && isDateOverdue(t.dueDate)
    );
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Все уведомления прочитаны', undefined, 'info');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('Уведомления очищены', undefined, 'info');
  };

  // Settings & Storage management
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    showToast('Настройки сохранены', undefined, 'success');
  };

  const resetToDemoData = () => {
    storage.resetToDemoData();
    setTasks(storage.loadTasks());
    setProjects(storage.loadProjects());
    setGoals(storage.loadGoals());
    setPeople(storage.loadPeople());
    setTransactions(storage.loadTransactions());
    setDebts(storage.loadDebts());
    setPayments(storage.loadPayments());
    setNotifications(storage.loadNotifications());
    setSettings(storage.loadSettings());
    showToast('Демо-данные восстановлены', 'Все разделы заполнены тестовыми данными', 'success');
  };

  const realignDatesToToday = () => {
    storage.resetToDemoData();
    setTasks(storage.loadTasks());
    setProjects(storage.loadProjects());
    setGoals(storage.loadGoals());
    setPeople(storage.loadPeople());
    setTransactions(storage.loadTransactions());
    setDebts(storage.loadDebts());
    setPayments(storage.loadPayments());
    setNotifications(storage.loadNotifications());
    setSettings(storage.loadSettings());
    showToast('Даты обновлены', 'Все расписания и задачи привязаны к текущему дню', 'success');
  };

  const clearAllData = () => {
    storage.clearAllData();
    setTasks([]);
    setProjects([]);
    setGoals([]);
    setPeople([]);
    setTransactions([]);
    setDebts([]);
    setPayments([]);
    setNotifications([]);
    showToast('Все данные очищены', 'База данных приложения пуста', 'warning');
  };

  const importBackup = (jsonString: string): boolean => {
    const success = storage.importAllData(jsonString);
    if (success) {
      setTasks(storage.loadTasks());
      setProjects(storage.loadProjects());
      setGoals(storage.loadGoals());
      setPeople(storage.loadPeople());
      setTransactions(storage.loadTransactions());
      setDebts(storage.loadDebts());
      setPayments(storage.loadPayments());
      setNotifications(storage.loadNotifications());
      setSettings(storage.loadSettings());
      showToast('Резервная копия импортирована', 'Все данные успешно загружены', 'success');
      return true;
    }
    showToast('Ошибка импорта', 'Неверный формат JSON файла', 'error');
    return false;
  };

  const exportBackup = (): string => {
    return storage.exportAllData();
  };

  // Modal handlers
  const openTaskModal = (task?: Task | null, defaultDate?: string) => {
    setEditingTask(task || null);
    setDefaultTaskDate(defaultDate || (task ? task.dueDate : getTodayDateString()));
    setIsTaskModalOpen(true);
  };
  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const openTransactionModal = (tx?: Transaction | null, defaultType?: TransactionType) => {
    setEditingTransaction(tx || null);
    setDefaultTxType(defaultType || (tx ? tx.type : 'expense'));
    setIsTransactionModalOpen(true);
  };
  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const openDebtModal = (debt?: Debt | null, type: 'they_owe' | 'i_owe' = 'they_owe') => {
    setEditingDebt(debt || null);
    setDefaultDebtType(debt ? debt.type : type);
    setIsDebtModalOpen(true);
  };
  const closeDebtModal = () => {
    setIsDebtModalOpen(false);
    setEditingDebt(null);
  };

  const openPaymentModal = (debt: Debt) => {
    setPaymentTargetDebt(debt);
    setIsPaymentModalOpen(true);
  };
  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentTargetDebt(null);
  };

  const openProjectModal = (project?: Project | null) => {
    setEditingProject(project || null);
    setIsProjectModalOpen(true);
  };
  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const openGoalModal = (goal?: Goal | null) => {
    setEditingGoal(goal || null);
    setIsGoalModalOpen(true);
  };
  const closeGoalModal = () => {
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  const openPersonModal = (person?: Person | null) => {
    setEditingPerson(person || null);
    setIsPersonModalOpen(true);
  };
  const closePersonModal = () => {
    setIsPersonModalOpen(false);
    setEditingPerson(null);
  };

  const openCommandPalette = () => setIsCommandPaletteOpen(true);
  const closeCommandPalette = () => setIsCommandPaletteOpen(false);

  const openQuickAction = () => setIsQuickActionOpen(true);
  const closeQuickAction = () => setIsQuickActionOpen(false);

  return (
    <AppContext.Provider
      value={{
        tasks,
        projects,
        goals,
        people,
        transactions,
        debts,
        payments,
        debtPayments: payments,
        notifications,
        settings,
        toasts,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        toggleTaskSubtask,
        rescheduleTask,
        addProject,
        updateProject,
        deleteProject,
        addGoal,
        updateGoal,
        deleteGoal,
        updateGoalAmount,
        toggleGoalMilestone,
        addPerson,
        updatePerson,
        deletePerson,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addDebt,
        updateDebt,
        deleteDebt,
        settleDebtFull,
        addDebtPayment,
        deleteDebtPayment,
        getDebtPaidAmount,
        getDebtRemaining,
        getPersonDebtsSummary,
        getFinancialSummary,
        getTodayTasks,
        getOverdueTasks,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        updateSettings,
        resetToDemoData,
        realignDatesToToday,
        clearAllData,
        importBackup,
        exportBackup,
        showToast,
        dismissToast,
        isTaskModalOpen,
        editingTask,
        defaultTaskDate,
        openTaskModal,
        closeTaskModal,
        isTransactionModalOpen,
        editingTransaction,
        defaultTxType,
        openTransactionModal,
        closeTransactionModal,
        isDebtModalOpen,
        editingDebt,
        defaultDebtType,
        openDebtModal,
        closeDebtModal,
        isPaymentModalOpen,
        paymentTargetDebt,
        openPaymentModal,
        closePaymentModal,
        isProjectModalOpen,
        editingProject,
        openProjectModal,
        closeProjectModal,
        isGoalModalOpen,
        editingGoal,
        openGoalModal,
        closeGoalModal,
        isPersonModalOpen,
        editingPerson,
        openPersonModal,
        closePersonModal,
        isCommandPaletteOpen,
        openCommandPalette,
        closeCommandPalette,
        isQuickActionOpen,
        openQuickAction,
        closeQuickAction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
