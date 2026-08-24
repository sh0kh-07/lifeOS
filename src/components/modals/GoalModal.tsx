import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoalMilestone } from '../../types';
import { Button } from '../ui/Button';
import { AmountInput, Input, Select, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';

export const GoalModal: React.FC = () => {
  const { isGoalModalOpen, closeGoalModal, editingGoal, addGoal, updateGoal } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Финансы');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [unit, setUnit] = useState('сум');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<'active' | 'achieved' | 'paused'>('active');
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneTarget, setNewMilestoneTarget] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setDescription(editingGoal.description || '');
      setCategory(editingGoal.category || 'Финансы');
      setTargetAmount(String(editingGoal.targetAmount));
      setCurrentAmount(String(editingGoal.currentAmount));
      setUnit(editingGoal.unit === '$' ? 'сум' : editingGoal.unit || 'сум');
      setDeadline(editingGoal.deadline || '');
      setStatus(editingGoal.status);
      setMilestones(editingGoal.milestones || []);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Финансы');
      setTargetAmount('50 000 000');
      setCurrentAmount('0');
      setUnit('сум');
      setDeadline('');
      setStatus('active');
      setMilestones([]);
    }
    setError('');
    setNewMilestoneTitle('');
    setNewMilestoneTarget('');
  }, [editingGoal, isGoalModalOpen]);

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    const target = parseFloat(newMilestoneTarget.replace(/\s+/g, '')) || 0;
    const newM: GoalMilestone = {
      id: 'm-' + Date.now(),
      title: newMilestoneTitle.trim(),
      target,
      completed: false,
    };
    setMilestones([...milestones, newM]);
    setNewMilestoneTitle('');
    setNewMilestoneTarget('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetAmount.replace(/\s+/g, ''));
    const currentNum = parseFloat(currentAmount.replace(/\s+/g, '')) || 0;

    if (!title.trim()) {
      setError('Укажите название цели');
      return;
    }
    if (isNaN(targetNum) || targetNum <= 0) {
      setError('Укажите целевое числовое значение');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'Общее',
      targetAmount: targetNum,
      currentAmount: currentNum,
      unit: unit.trim() || 'сум',
      deadline: deadline || undefined,
      status,
      milestones,
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, payload);
    } else {
      addGoal(payload);
    }

    closeGoalModal();
  };

  return (
    <Modal
      isOpen={isGoalModalOpen}
      onClose={closeGoalModal}
      title={editingGoal ? 'Редактировать цель' : 'Новая цель'}
      subtitle="Определите измеримую метрику, этапы и дедлайн"
      maxWidth="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" type="button" onClick={closeGoalModal}>
            Отмена
          </Button>
          <Button variant="primary" size="sm" type="button" onClick={handleSubmit}>
            {editingGoal ? 'Сохранить изменения' : 'Поставить цель'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название цели"
          placeholder="Например: Накопить 50 000 000 сум / Купить оборудование"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
          error={error}
          required
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <AmountInput
            label="Целевое значение"
            placeholder="50 000 000"
            value={targetAmount}
            onChange={(val) => setTargetAmount(val)}
            required
          />
          <AmountInput
            label="Текущий прогресс"
            placeholder="0"
            value={currentAmount}
            onChange={(val) => setCurrentAmount(val)}
          />
          <Input
            label="Единица измерения"
            placeholder="сум, книг, км, %"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Категория"
            placeholder="Финансы, Карьера, Спорт"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Input
            label="Дедлайн"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <Select
            label="Статус"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'achieved' | 'paused')}
          >
            <option value="active">В процессе</option>
            <option value="achieved">Достигнута 🏆</option>
            <option value="paused">На паузе</option>
          </Select>
        </div>

        <Textarea
          label="Мотивация и описание"
          placeholder="Почему эта цель важна? Что изменится после ее достижения?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        {/* Milestones */}
        <div className="space-y-2 pt-2 border-t border-[#242A33]">
          <label className="block text-xs font-medium text-[#8B93A1]">Промежуточные контрольные точки (Milestones)</label>
          <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#11151B] border border-[#242A33] text-xs text-[#F5F7FA]"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={m.completed ? 'line-through text-[#8B93A1]' : ''}>{m.title}</span>
                  {m.target > 0 && (
                    <span className="text-[#8B93A1]">
                      ({m.target.toLocaleString('ru-RU')} {unit})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(m.id)}
                  className="text-[#8B93A1] hover:text-red-400 p-1 cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Название этапа (например: Первые 15 000 000 сум)"
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              className="flex-1 bg-[#11151B] border border-[#242A33] text-xs text-[#F5F7FA] rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Сумма"
              value={newMilestoneTarget}
              onChange={(e) => setNewMilestoneTarget(e.target.value)}
              className="w-32 bg-[#11151B] border border-[#242A33] text-xs text-[#F5F7FA] rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddMilestone}
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

