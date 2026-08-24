import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Currency, ProjectStatus } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';

export const ProjectModal: React.FC = () => {
  const {
    isProjectModalOpen,
    closeProjectModal,
    editingProject,
    addProject,
    updateProject,
    settings,
  } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('in_progress');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#6366F1');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState<Currency>(settings.defaultCurrency);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const colors = [
    '#6366F1', // Indigo
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#EF4444', // Red
  ];

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setDescription(editingProject.description || '');
      setStatus(editingProject.status);
      setDeadline(editingProject.deadline || '');
      setColor(editingProject.color || '#6366F1');
      setBudget(editingProject.budget ? String(editingProject.budget) : '');
      setCurrency(editingProject.currency);
      setNotes(editingProject.notes || '');
    } else {
      setName('');
      setDescription('');
      setStatus('in_progress');
      setDeadline('');
      setColor('#6366F1');
      setBudget('');
      setCurrency(settings.defaultCurrency);
      setNotes('');
    }
    setError('');
  }, [editingProject, isProjectModalOpen, settings.defaultCurrency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Укажите название проекта');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      status,
      deadline: deadline || undefined,
      color,
      budget: budget ? parseFloat(budget) : undefined,
      currency,
      notes: notes.trim(),
    };

    if (editingProject) {
      updateProject(editingProject.id, payload);
    } else {
      addProject(payload);
    }

    closeProjectModal();
  };

  return (
    <Modal
      isOpen={isProjectModalOpen}
      onClose={closeProjectModal}
      title={editingProject ? 'Редактировать проект' : 'Создать проект'}
      subtitle="Управление целями, сроками и бюджетом проекта"
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" size="sm" type="button" onClick={closeProjectModal}>
            Отмена
          </Button>
          <Button variant="primary" size="sm" type="button" onClick={handleSubmit}>
            {editingProject ? 'Сохранить изменения' : 'Создать проект'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название проекта"
          placeholder="Например: Launch Mobile App MVP"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          error={error}
          required
          autoFocus
        />

        <Textarea
          label="Описание / Цель проекта"
          placeholder="Краткое описание ключевых результатов..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        {/* Status & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Статус"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            <option value="planning">Планирование</option>
            <option value="in_progress">В работе</option>
            <option value="on_hold">На паузе</option>
            <option value="completed">Завершен</option>
          </Select>

          <Input
            label="Дедлайн"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        {/* Budget & Currency */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <Input
              label="Бюджет (опционально)"
              type="number"
              min="0"
              placeholder="0.00"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
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

        {/* Color Palette */}
        <div className="space-y-2 text-left">
          <label className="block text-xs font-medium text-[#8B93A1]">Цветовая метка</label>
          <div className="flex items-center gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                  color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#151A21] scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <Textarea
          label="Заметки по проекту"
          placeholder="Стек технологий, ссылки на ресурсы, соглашения..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </form>
    </Modal>
  );
};
