import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Priority, Subtask, TaskStatus } from '../../types';
import { getTodayDateString } from '../../utils/date';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';

export const TaskModal: React.FC = () => {
  const { isTaskModalOpen, closeTaskModal, editingTask, defaultTaskDate, addTask, updateTask, projects } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('planned');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [projectId, setProjectId] = useState('');
  const [category, setCategory] = useState('Работа');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setStatus(editingTask.status);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate || getTodayDateString());
      setDueTime(editingTask.dueTime || '');
      setProjectId(editingTask.projectId || '');
      setCategory(editingTask.category || 'Работа');
      setTags(editingTask.tags || []);
      setSubtasks(editingTask.subtasks || []);
      setEstimatedTime(editingTask.estimatedTime ? String(editingTask.estimatedTime) : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('planned');
      setPriority('medium');
      setDueDate(defaultTaskDate || getTodayDateString());
      setDueTime('');
      setProjectId('');
      setCategory('Работа');
      setTags([]);
      setSubtasks([]);
      setEstimatedTime('');
    }
    setError('');
    setTagInput('');
    setNewSubtaskTitle('');
  }, [editingTask, defaultTaskDate, isTaskModalOpen]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^#/, '');
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: 'sub-' + Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Укажите название задачи');
      return;
    }
    if (!dueDate) {
      setError('Укажите дату выполнения');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate,
      dueTime: dueTime || undefined,
      projectId: projectId || undefined,
      category: category.trim() || 'Общее',
      tags,
      subtasks,
      estimatedTime: estimatedTime ? parseInt(estimatedTime, 10) : undefined,
    };

    if (editingTask) {
      updateTask(editingTask.id, payload);
    } else {
      addTask(payload);
    }

    closeTaskModal();
  };

  return (
    <Modal
      isOpen={isTaskModalOpen}
      onClose={closeTaskModal}
      title={editingTask ? 'Редактировать задачу' : 'Новая задача'}
      subtitle="Заполните параметры задачи и чек-лист"
      maxWidth="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" type="button" onClick={closeTaskModal}>
            Отмена
          </Button>
          <Button variant="primary" size="sm" type="button" onClick={handleSubmit}>
            {editingTask ? 'Сохранить изменения' : 'Создать задачу'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название задачи"
          placeholder="Например: Согласовать договор с клиентом"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
          error={error}
          required
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Дата"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <Input
            label="Время (опционально)"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Приоритет"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
            <option value="urgent">Срочно ⚡</option>
          </Select>

          <Select
            label="Статус"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            <option value="inbox">Входящие</option>
            <option value="planned">Запланировано</option>
            <option value="in_progress">В работе</option>
            <option value="waiting">Ожидание</option>
            <option value="completed">Выполнено</option>
            <option value="cancelled">Отменено</option>
          </Select>

          <Select
            label="Проект"
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Категория"
            placeholder="Работа, Личное, Здоровье, Финансы"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Input
            label="Оценка времени (минут)"
            type="number"
            min="0"
            step="5"
            placeholder="30"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
          />
        </div>

        <Textarea
          label="Описание / Заметки"
          placeholder="Детали, ссылки, критерии завершения..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        {/* Subtasks */}
        <div className="space-y-2 pt-2 border-t border-[#242A33]">
          <label className="block text-xs font-medium text-[#8B93A1]">Чек-лист / Подзадачи</label>
          <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
            {subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#11151B] border border-[#242A33]"
              >
                <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => handleToggleSubtask(st.id)}
                    className="rounded border-[#242A33] text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-600"
                  />
                  <span
                    className={`text-xs text-[#F5F7FA] truncate ${
                      st.completed ? 'line-through text-[#8B93A1]' : ''
                    }`}
                  >
                    {st.title}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(st.id)}
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
              placeholder="Добавить пункт подзадачи..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              className="flex-1 bg-[#11151B] border border-[#242A33] text-xs text-[#F5F7FA] rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddSubtask}
            >
              <Plus size={14} /> Добавить
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2 pt-2 border-t border-[#242A33]">
          <label className="block text-xs font-medium text-[#8B93A1]">Теги</label>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1C232D] text-xs text-[#F5F7FA] border border-[#242A33]"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-[#8B93A1] hover:text-red-400 ml-0.5 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Введите тег и нажмите Enter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="w-full bg-[#11151B] border border-[#242A33] text-xs text-[#F5F7FA] rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          />
        </div>
      </form>
    </Modal>
  );
};
