import React, { useMemo, useState } from 'react';
import {
  FileText,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { Person } from '../types';
import { formatMoney, formatUzbekPhone } from '../utils/format';

export const PeoplePage: React.FC = () => {
  const {
    people,
    debts,
    openPersonModal,
    deletePerson,
    openDebtModal,
  } = useApp();

  const [search, setSearch] = useState('');

  const filteredPeople = useMemo(() => {
    if (!search.trim()) return people;
    const q = search.toLowerCase();
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.roleOrRelation && p.roleOrRelation.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q))
    );
  }, [people, search]);

  const getPersonDebtInfo = (personId: string, personName: string) => {
    const matchedDebts = debts.filter(
      (d) => (d.personId === personId || d.personName.toLowerCase() === personName.toLowerCase()) && d.status !== 'paid'
    );
    return matchedDebts;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Люди и контакты</h1>
          <p className="text-xs sm:text-sm text-[#8B93A1]">
            Записная книжка ключевых контрагентов, партнеров и связанных финансовых обязательств
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => openPersonModal()}
          className="font-semibold shadow-xs"
        >
          <Plus size={16} /> Добавить контакт
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-3 text-[#8B93A1]" />
        <input
          type="text"
          placeholder="Поиск по имени, роли, телефону (+998)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#151A21] border border-[#242A33] text-xs text-[#F5F7FA] placeholder-[#576071] rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-indigo-500"
        />
      </div>

      {/* People Grid */}
      {filteredPeople.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Контакты не найдены"
          description="Добавьте ваших контрагентов для удобной привязки к долгам и задачам."
          actionText="+ Добавить контакт"
          onAction={() => openPersonModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person: Person) => {
            const personDebts = getPersonDebtInfo(person.id, person.name);

            return (
              <Card
                key={person.id}
                className="flex flex-col justify-between hover:border-[#353D4A] transition"
              >
                <div>
                  {/* Top Bar with Avatar */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
                        style={{ backgroundColor: person.avatarColor || '#3B82F6' }}
                      >
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#F5F7FA]">{person.name}</h3>
                        {person.roleOrRelation && (
                          <span className="text-xs text-indigo-400 font-medium">
                            {person.roleOrRelation}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openPersonModal(person)}
                        className="text-xs text-[#8B93A1] hover:text-[#F5F7FA] p-1 rounded hover:bg-[#1C232D] transition cursor-pointer"
                      >
                        Правка
                      </button>
                      <button
                        onClick={() => deletePerson(person.id)}
                        className="text-xs text-[#8B93A1] hover:text-red-400 p-1 rounded hover:bg-[#1C232D] transition cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Contacts Info */}
                  <div className="space-y-1.5 text-xs text-[#8B93A1] my-3">
                    {person.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-indigo-400 shrink-0" />
                        <span className="font-mono text-[#F5F7FA]">{formatUzbekPhone(person.phone)}</span>
                      </div>
                    )}
                    {person.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-indigo-400 shrink-0" />
                        <span className="truncate">{person.email}</span>
                      </div>
                    )}
                  </div>

                  {person.notes && (
                    <p className="text-xs text-[#8B93A1] line-clamp-2 mt-2 bg-[#11151B] p-2 rounded-lg border border-[#242A33]">
                      {person.notes}
                    </p>
                  )}

                  {/* Connected Debts Banner */}
                  {personDebts.length > 0 && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
                      <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                        <FileText size={12} /> Активные обязательства ({personDebts.length}):
                      </div>
                      {personDebts.map((d) => (
                        <div key={d.id} className="text-xs flex justify-between text-[#F5F7FA]">
                          <span>{d.type === 'they_owe' ? 'Мне должен' : 'Я должен'}:</span>
                          <span className="font-bold font-mono">
                            {formatMoney(d.totalAmount, 'UZS')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 mt-3 border-t border-[#242A33] flex items-center justify-between text-xs">
                  <button
                    onClick={() => openDebtModal(null, 'they_owe', person.id)}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Plus size={12} /> Создать долг
                  </button>
                  <span className="text-[10px] text-[#576071]">LifeOS Contact</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

