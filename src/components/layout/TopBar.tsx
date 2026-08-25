import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  HardDrive,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateReadable, getTodayDateString, WEEKDAYS_FULL_RU } from '../../utils/date';

export const TopBar: React.FC = () => {
  const {
    settings,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    openCommandPalette,
    openQuickAction,
    saveToPc,
    connectedPcFileName,
    lastSavedToPc,
    isSavingToPc,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadNotifs = notifications.filter((n) => !n.read);
  const todayStr = getTodayDateString();
  const todayDate = new Date();
  const dayOfWeek = (todayDate.getDay() + 6) % 7;
  const weekdayName = WEEKDAYS_FULL_RU[dayOfWeek];
  const dateFormatted = `${weekdayName}, ${formatDateReadable(todayStr, false)}`;

  return (
    <header className="h-16 border-b border-[#242A33] bg-[#0B0D10] sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8">
      {/* Left: Search input field */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div
          onClick={openCommandPalette}
          className="relative w-full max-w-sm sm:max-w-md cursor-pointer group"
        >
          <input
            type="text"
            readOnly
            placeholder="Поиск по системе (⌘+K / Ctrl+K)..."
            className="w-full bg-[#11151B] border border-[#242A33] rounded-md py-1.5 pl-10 pr-12 text-xs sm:text-sm text-[#F5F7FA] placeholder-[#8B93A1] group-hover:border-[#353D4A] focus:outline-none focus:border-[#6366F1] cursor-pointer transition-colors"
          />
          <Search
            size={15}
            className="absolute left-3.5 top-2.5 text-[#8B93A1] group-hover:text-[#F5F7FA] transition-colors pointer-events-none"
          />
          <div className="absolute right-2.5 top-1.5 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-[#151A21] border border-[#242A33] rounded text-[#8B93A1]">
            <span className="text-xs">⌘</span>K
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-[#8B93A1] pl-2 border-l border-[#242A33]">
          <Clock size={13} className="text-[#6366F1]" />
          <span>{dateFormatted}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Save to PC Button */}
        <button
          onClick={() => saveToPc()}
          disabled={isSavingToPc}
          title={
            connectedPcFileName
              ? `Синхронизировать с ${connectedPcFileName} (посл: ${lastSavedToPc || 'сейчас'})`
              : 'Сохранить состояние на ПК (JSON)'
          }
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded bg-[#151A21] hover:bg-[#1C222B] active:bg-[#252D3A] border border-[#242A33] hover:border-indigo-500/50 text-[#F5F7FA] text-xs font-medium transition-colors cursor-pointer"
        >
          <HardDrive size={13} className={connectedPcFileName ? 'text-emerald-400' : 'text-indigo-400'} />
          <span>{isSavingToPc ? 'Сохранение...' : 'На ПК'}</span>
        </button>

        {/* + New Entry CTA */}
        <button
          onClick={openQuickAction}
          className="bg-[#6366F1] hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold px-3.5 sm:px-4 py-2 rounded shadow-lg shadow-[#6366F1]/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={15} />
          <span>Новая запись</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[#242A33]" />

        {/* Notification Center */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 hover:bg-[#151A21] rounded transition-colors text-[#8B93A1] hover:text-[#F5F7FA] relative cursor-pointer"
            aria-label="Уведомления"
            title="Уведомления"
          >
            <Bell size={18} />
            {unreadNotifs.length > 0 && (
              <span className="absolute 1.5 top-1.5 right-1.5 w-2 h-2 bg-[#6366F1] rounded-full animate-pulse ring-2 ring-[#0B0D10]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#11151B] border border-[#242A33] rounded-xl shadow-2xl z-40 overflow-hidden text-left animate-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between p-3.5 border-b border-[#242A33] bg-[#151A21]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#F5F7FA]">Уведомления</span>
                    {unreadNotifs.length > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#6366F1]/20 text-[#6366F1] rounded">
                        {unreadNotifs.length} новых
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-[#6366F1] hover:underline p-1 flex items-center gap-1 cursor-pointer"
                        title="Отметить все как прочитанные"
                      >
                        <Check size={12} /> Все
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-[#8B93A1] hover:text-[#EF4444] p-1 cursor-pointer"
                        title="Очистить список"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-[#242A33]/50">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#8B93A1]">
                      Нет новых уведомлений
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.link) {
                            setIsNotifOpen(false);
                            navigate(n.link);
                          }
                        }}
                        className={`p-3 transition cursor-pointer hover:bg-[#151A21] ${
                          !n.read ? 'bg-[#6366F1]/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-xs font-semibold ${
                              !n.read ? 'text-[#F5F7FA]' : 'text-[#8B93A1]'
                            }`}
                          >
                            {n.title}
                          </span>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-[#8B93A1] mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        {n.link && (
                          <div className="mt-2 text-[10px] text-[#6366F1] flex items-center gap-1">
                            <span>Перейти</span>
                            <ExternalLink size={10} />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User initials circle */}
        <div
          onClick={() => navigate('/settings')}
          className="w-8 h-8 rounded-full bg-[#151A21] border border-[#242A33] hover:border-[#6366F1] text-[#F5F7FA] font-semibold text-xs flex items-center justify-center cursor-pointer transition-colors"
          title="Настройки"
        >
          {settings.userName ? settings.userName.charAt(0).toUpperCase() : 'A'}
        </div>
      </div>
    </header>
  );
};
