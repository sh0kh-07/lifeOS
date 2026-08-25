import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  CircleDollarSign,
  Code2,
  Database,
  Download,
  FolderSync,
  HardDrive,
  Laptop,
  Moon,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Unlink,
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
    saveToPc,
    loadFromPc,
    disconnectPcFile,
    connectedPcFileName,
    lastSavedToPc,
    isSavingToPc,
    isFileSystemSupported,
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
    downloadAnchor.setAttribute('download', `planner_backup_${new Date().toISOString().slice(0, 10)}.json`);
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
          Персонализация интерфейса, сохранение памяти на ПК, резервное копирование и управление данными
        </p>
      </div>

      {/* Direct PC Memory & Storage Section */}
      <Card noPadding className="border-indigo-500/30">
        <CardHeader
          title="Сохранение памяти на ваш ПК"
          subtitle="Прямая запись данных на жесткий диск вашего компьютера в формате JSON / файла резервной копии"
        />
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-[#11151B] border border-[#242A33] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                  <HardDrive size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#F5F7FA]">
                      Хранилище на локальном диске
                    </span>
                    {connectedPcFileName ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md">
                        Подключено: {connectedPcFileName}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-[#151A21] text-[#8B93A1] border border-[#242A33] rounded-md">
                        Автономно
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8B93A1] mt-1 leading-relaxed">
                    {connectedPcFileName
                      ? `Текущий рабочий файл на вашем ПК: ${connectedPcFileName}. Все изменения сохраняются непосредственно в него.`
                      : 'Сохраняйте все задачи, финансы, долги, проекты и цели прямо в файл на вашем компьютере для 100% автономности и безопасности.'}
                  </p>
                  {lastSavedToPc && (
                    <div className="text-[11px] text-indigo-400 flex items-center gap-1 mt-1.5 font-mono">
                      <Check size={12} />
                      <span>Последнее сохранение на ПК: {lastSavedToPc}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => saveToPc()}
                  disabled={isSavingToPc}
                  className="font-semibold shadow-xs"
                >
                  <Save size={14} />
                  <span>{isSavingToPc ? 'Сохранение...' : 'Сохранить на ПК'}</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => loadFromPc()}
                  className="font-semibold"
                >
                  <Upload size={14} />
                  <span>Загрузить с ПК</span>
                </Button>

                {connectedPcFileName && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={disconnectPcFile}
                    title="Отключить связь с файлом"
                    className="text-xs text-[#8B93A1] hover:text-red-400"
                  >
                    <Unlink size={13} />
                  </Button>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#242A33]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#8B93A1] gap-2">
              <div className="flex items-center gap-2">
                <FolderSync size={13} className="text-emerald-400" />
                <span>
                  {isFileSystemSupported
                    ? 'Поддерживается прямая синхронизация с файловой системой ПК (File System API)'
                    : 'Поддерживается прямое скачивание и загрузка файлов памяти на ПК'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-indigo-300">
                Формат: Universal JSON Bundle
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LocatorJS Info & Dev Inspector */}
      <Card noPadding className="border-indigo-900/40">
        <CardHeader
          title="Интеграция LocatorJS (UI Inspector)"
          subtitle="Быстрая навигация к исходному коду компонентов прямо из браузера"
        />
        <CardContent>
          <div className="p-4 rounded-xl bg-[#11151B] border border-[#242A33] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                <Code2 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#F5F7FA]">LocatorJS Runtime активен</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md">
                    Alt + Click
                  </span>
                </div>
                <p className="text-xs text-[#8B93A1] mt-1">
                  Зажмите клавишу <kbd className="px-1.5 py-0.5 text-[10px] bg-[#151A21] border border-[#242A33] rounded text-indigo-300 font-mono">Alt</kbd> (или <kbd className="px-1.5 py-0.5 text-[10px] bg-[#151A21] border border-[#242A33] rounded text-indigo-300 font-mono">Option</kbd> на Mac) и наведите курсор на любой элемент интерфейса для мгновенной подсветки компонента и перехода к коду.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <option value="UZS">UZS (сум) — Узбекский сум</option>
                <option value="USD">USD ($) — Доллар США</option>
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
          <span>Professional Polish Theme • v1.1.0 • Client-Side Local Storage & PC Memory Sync</span>
        </div>
        <div className="flex items-center gap-2">
          <Database size={13} />
          <span>Local Engine Active</span>
        </div>
      </div>
    </div>
  );
};
