import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Currency, TransactionType } from '../../types';
import { getTodayDateString } from '../../utils/date';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';

export const TransactionModal: React.FC = () => {
  const {
    isTransactionModalOpen,
    closeTransactionModal,
    editingTransaction,
    defaultTxType,
    addTransaction,
    updateTransaction,
    projects,
    people,
    settings,
  } = useApp();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(settings.defaultCurrency);
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [personId, setPersonId] = useState('');
  const [error, setError] = useState('');

  const incomeCategories = [
    'Клиентские проекты',
    'Зарплата / Аванс',
    'Консалтинг',
    'Инвестиции / Дивиденды',
    'Возврат долга',
    'Продажа активов',
    'Другое',
  ];

  const expenseCategories = [
    'Инфраструктура / Серверы',
    'Программное обеспечение',
    'Питание и кафе',
    'Транспорт / Такси',
    'Жилье и коммуналка',
    'Оборудование',
    'Маркетинг и реклама',
    'Образование и книги',
    'Здоровье и спорт',
    'Другое',
  ];

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCurrency(editingTransaction.currency);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setDescription(editingTransaction.description || '');
      setProjectId(editingTransaction.projectId || '');
      setPersonId(editingTransaction.personId || '');
    } else {
      setType(defaultTxType);
      setAmount('');
      setCurrency(settings.defaultCurrency);
      setCategory(defaultTxType === 'income' ? incomeCategories[0] : expenseCategories[0]);
      setDate(getTodayDateString());
      setDescription('');
      setProjectId('');
      setPersonId('');
    }
    setError('');
  }, [editingTransaction, defaultTxType, isTransactionModalOpen, settings.defaultCurrency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Укажите корректную положительную сумму');
      return;
    }
    if (!category.trim()) {
      setError('Укажите категорию транзакции');
      return;
    }
    if (!date) {
      setError('Укажите дату');
      return;
    }

    const payload = {
      type,
      amount: numAmount,
      currency,
      category: category.trim(),
      date,
      description: description.trim() || category,
      projectId: projectId || undefined,
      personId: personId || undefined,
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, payload);
    } else {
      addTransaction(payload);
    }

    closeTransactionModal();
  };

  return (
    <Modal
      isOpen={isTransactionModalOpen}
      onClose={closeTransactionModal}
      title={editingTransaction ? 'Редактировать запись' : type === 'income' ? 'Новый доход' : 'Новый расход'}
      subtitle="Фиксация финансовой операции с привязкой к проекту или контрагенту"
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" size="sm" type="button" onClick={closeTransactionModal}>
            Отмена
          </Button>
          <Button
            variant={type === 'income' ? 'success' : 'danger'}
            size="sm"
            type="button"
            onClick={handleSubmit}
          >
            {editingTransaction ? 'Сохранить' : type === 'income' ? '+ Записать доход' : '- Записать расход'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#11151B] border border-[#242A33] rounded-lg">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory(expenseCategories[0]);
            }}
            className={`py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
              type === 'expense'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-[#8B93A1] hover:text-[#F5F7FA]'
            }`}
          >
            Расход (-)
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory(incomeCategories[0]);
            }}
            className={`py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-[#8B93A1] hover:text-[#F5F7FA]'
            }`}
          >
            Доход (+)
          </button>
        </div>

        {/* Amount & Currency */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <Input
              label="Сумма"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              error={error}
              required
              autoFocus
            />
          </div>
          <Select
            label="Валюта"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
          >
            <option value="USD">USD ($)</option>
            <option value="UZS">UZS (сум)</option>
            <option value="EUR">EUR (€)</option>
            <option value="RUB">RUB (₽)</option>
          </Select>
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-medium text-[#8B93A1]">Категория</label>
            <input
              list="categories-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Выберите или введите..."
              className="w-full bg-[#11151B] border border-[#242A33] focus:border-indigo-500 text-[#F5F7FA] text-sm rounded-lg px-3.5 py-2.5 outline-none"
              required
            />
            <datalist id="categories-list">
              {(type === 'income' ? incomeCategories : expenseCategories).map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <Input
            label="Дата операции"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Project and Person linking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Связанный проект"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">Без проекта</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>

          <Select
            label="Человек / Контрагент"
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
          >
            <option value="">Не выбрано</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>

        <Textarea
          label="Описание / Назначение платежа"
          placeholder="Краткий комментарий или назначение транзакции..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </form>
    </Modal>
  );
};
