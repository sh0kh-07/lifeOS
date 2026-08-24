import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  CircleDollarSign,
  Database,
  Download,
  Moon,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { useApp } from '../context/AppContext';
import { Currency } from '../types';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportBackup,
    importBackup,
    resetToDemoData,
    realignDatesToToday,
    clearAllData,
  } = useApp();

  const [userName, setUserName] = useState(settings.userName);
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>(settings.defaultCurrency);
  const [startOfWeek, setStartOfWeek] = useState<'monday' | 'sunday'>(settings.startOfWeek);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      userName: userName.trim() || 'Пользователь',
      defaultCurrency,
      startOfWeek,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importBackup(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportBackup());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Настройки</h1>
        <p className="text-xs sm:text-sm text-[#8B93A1]">
          Персонализация интерфейса, валюты по умолчанию, резервное копирование и управление датами
        </p>
      </div>

      {/* Profile & General Preferences */}
      <Card noPadding>
        <CardHeader
          title="Профиль и предпочтения"
          subtitle="Настройте отображение данных и валюту учета"
        />
        <CardContent>
          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Ваше имя / Обращение"
                placeholder="Александр"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />

              <Select
                label="Основная валюта по умолчанию"
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value as Currency)}
              >
                <option value="USD">USD ($) — Доллар США</option>
                <option value="UZS">UZS (сум) — Узбекский сум</option>
                <option value="EUR">EUR (€) — Евро</option>
                <option value="RUB">RUB (₽) — Российский рубль</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Первый день недели в календаре"
                value={startOfWeek}
                onChange={(e) => setStartOfWeek(e.target.value as 'monday' | 'sunday')}
              >
                <option value="monday">Понедельник</option>
                <option value="sunday">Воскресенье</option>
              </Select>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium text-[#8B93A1]">Цветовая тема</label>
                <div className="p-2.5 rounded-xl bg-[#11151B] border border-[#242A33] text-xs text-[#F5F7FA] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon size={14} className="text-indigo-400" />
                    <span>Deep Charcoal Dark (Активна)</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">PREMIUM</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button type="submit" variant="primary" size="sm" className="font-semibold shadow-xs">
                <Save size={14} /> Сохранить настройки
              </Button>
              {savedSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 animate-in fade-in">
                  <Check size={14} /> Настройки успешно применены
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Date Alignment & Data Reset Control */}
      <Card noPadding>
        <CardHeader
          title="Синхронизация и сброс дат"
          subtitle="Привязка всех задач, дедлайнов и графиков к текущему сегодняшнему дню"
        />
        <CardContent>
          <div className="p-4 rounded-xl bg-[#11151B] border border-[#242A33] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F7FA]">
                <Calendar size={16} className="text-indigo-400" />
                <span>Обнулить / Синхронизировать даты с сегодняшним днем</span>
              </div>
              <p className="text-xs text-[#8B93A1] mt-1">
                Автоматически пересчитает даты всех задач, дедлайнов проектов и долгов относительно сегодняшнего дня.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={realignDatesToToday}
              className="text-xs shrink-0 font-semibold"
            >
              <RotateCcw size={13} /> Обнулить на Сегодня
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Restore Section */}
      <Card noPadding>
        <CardHeader
          title="Резервное копирование и экспорт"
          subtitle="Все ваши данные хранятся локально в вашем браузере. Вы можете экспортировать их в любой момент."
        />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Export JSON */}
            <div className="p-4 rounded-xl bg-[#11151B] border border-[#242A33] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F7FA]">
                  <Download size={16} className="text-indigo-400" />
                  <span>Экспорт данных (JSON)</span>
                </div>
                <p className="text-xs text-[#8B93A1] mt-1">
                  Сохраните файл со всеми задачами, проектами, финансами, долгами и целями на ваш компьютер.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadBackup}
                className="w-full justify-center"
              >
                <Download size={14} /> Скачать backup.json
              </Button>
            </div>

            {/* Import JSON */}
            <div className="p-4 rounded-xl bg-[#11151B] border border-[#242A33] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F7FA]">
                  <Upload size={16} className="text-emerald-400" />
                  <span>Импорт из файла</span>
                </div>
                <p className="text-xs text-[#8B93A1] mt-1">
                  Восстановите состояние приложения из ранее сохраненного файла backup.json.
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full justify-center"
              >
                <Upload size={14} /> Загрузить backup.json
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card noPadding className="border-red-900/30">
        <CardHeader
          title="Сброс и очистка данных"
          subtitle="Действия с локальным хранилищем"
        />
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-950/10 border border-red-500/20">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-[#F5F7FA]">
                Демо-данные и полный сброс
              </div>
              <p className="text-xs text-[#8B93A1] mt-0.5">
                Вы можете перезагрузить демонстрационный набор или полностью очистить хранилище.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (window.confirm('Сбросить текущие данные и загрузить демонстрационный набор?')) {
                    resetToDemoData();
                  }
                }}
                className="text-xs"
              >
                <RotateCcw size={13} /> Демо-данные
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (window.confirm('ВНИМАНИЕ! Это действие удалит все данные без возможности отмены. Продолжить?')) {
                    clearAllData();
                  }
                }}
                className="text-xs"
              >
                <Trash2 size={13} /> Очистить всё
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System info badge */}
      <div className="p-4 rounded-xl bg-[#11151B] border border-[#242A33] flex items-center justify-between text-xs text-[#8B93A1]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-indigo-400" />
          <span>Professional Polish Theme • v1.1.0 • Client-Side Local Storage</span>
        </div>
        <div className="flex items-center gap-2">
          <Database size={13} />
          <span>Local Engine Active</span>
        </div>
      </div>
    </div>
  );
};
