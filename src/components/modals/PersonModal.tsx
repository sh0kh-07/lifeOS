import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Input, PhoneInput, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';

export const PersonModal: React.FC = () => {
  const { isPersonModalOpen, closePersonModal, editingPerson, addPerson, updatePerson } = useApp();

  const [name, setName] = useState('');
  const [roleOrRelation, setRoleOrRelation] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState('#3B82F6');
  const [error, setError] = useState('');

  const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#6366F1'];

  useEffect(() => {
    if (editingPerson) {
      setName(editingPerson.name);
      setRoleOrRelation(editingPerson.roleOrRelation || '');
      setPhone(editingPerson.phone || '+998 ');
      setEmail(editingPerson.email || '');
      setNotes(editingPerson.notes || '');
      setAvatarColor(editingPerson.avatarColor || '#3B82F6');
    } else {
      setName('');
      setRoleOrRelation('');
      setPhone('+998 ');
      setEmail('');
      setNotes('');
      setAvatarColor(colors[Math.floor(Math.random() * colors.length)]);
    }
    setError('');
  }, [editingPerson, isPersonModalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Укажите имя человека или название контрагента');
      return;
    }

    const cleanPhone = phone.trim();
    const payload = {
      name: name.trim(),
      roleOrRelation: roleOrRelation.trim() || undefined,
      phone: cleanPhone && cleanPhone !== '+998' ? cleanPhone : undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      avatarColor,
    };

    if (editingPerson) {
      updatePerson(editingPerson.id, payload);
    } else {
      addPerson(payload);
    }

    closePersonModal();
  };

  return (
    <Modal
      isOpen={isPersonModalOpen}
      onClose={closePersonModal}
      title={editingPerson ? 'Редактировать контакт' : 'Новый контакт'}
      subtitle="Связи с долгами, задачами и совместными проектами"
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" size="sm" type="button" onClick={closePersonModal}>
            Отмена
          </Button>
          <Button variant="primary" size="sm" type="button" onClick={handleSubmit}>
            {editingPerson ? 'Сохранить изменения' : 'Добавить контакт'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Имя / Организация"
          placeholder="Например: Иван Смирнов"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          error={error}
          required
          autoFocus
        />

        <Input
          label="Роль / Отношение"
          placeholder="Бизнес-партнер, Клиент, Друг, Подрядчик"
          value={roleOrRelation}
          onChange={(e) => setRoleOrRelation(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PhoneInput
            label="Телефон (Узбекистан +998)"
            placeholder="+998 90 123-45-67"
            value={phone}
            onChange={(val) => setPhone(val)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="contact@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Avatar Color */}
        <div className="space-y-2 text-left">
          <label className="block text-xs font-medium text-[#8B93A1]">Цвет аватара</label>
          <div className="flex items-center gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAvatarColor(c)}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                  avatarColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#151A21] scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <Textarea
          label="Заметки"
          placeholder="Договоренности, история знакомства, детали..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </form>
    </Modal>
  );
};

