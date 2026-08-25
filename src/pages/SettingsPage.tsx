import React, { useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Calendar,
  Check,
  CircleDollarSign,
  Database,
  Download,
  FileCode,
  FilePlus2,
  FolderOpen,
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
    pickAndBindExistingJsonFile,
    createAndBindNewJsonFile,
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
          Персонализация интерфейса, Real-time автосохранение на ПК, резервное копирование и управление данными
        </p>
      </div>

      {/* Real-time PC Memory & Live Auto-save Section */}
      <Card noPadding className="border-indigo-500/30">
        <CardHeader
          title="Автосохранение напрямую в JSON-файл на ПК"
          subtitle="Выберите файл .json на вашем компьютере: все изменения будут автоматически записываться прямо в него"
        />
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-[#11151B] border border-[#242A33] space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                  <HardDrive size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#F5F7FA]">
                      Привязанный файл JSON на диске:
                    </span>
                    {connectedPcFileName ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {connectedPcFileName}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-[#151A21] text-[#8B93A1] border border-[#242A33] rounded-md">
                        Файл не выбран (память браузера)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8B93A1] mt-1.5 leading-relaxed">
                    {connectedPcFileName
                      ? `Файл ${connectedPcFileName} активен. Каждое изменение (задачи, финансы, долги, цели, заметки) моментально и непрерывно перезаписывается в этот файл.`
                      : 'Выберите ваш .json файл на ПК: приложение будет автоматически сохранять все обновления прямо в него.'}
                  </p>
                  {lastSavedToPc && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-2 font-mono">
                      <Activity size={12} className="text-emerald-400 shrink-0 animate-pulse" />
                      <span>Потоковая запись активна (посл. сохранение: {lastSavedToPc})</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {connectedPcFileName ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => saveToPc()}
                      disabled={isSavingToPc}
                      className="font-semibold shadow-xs"
                    >
                      <Save size={14} />
                      <span>{isSavingToPc ? 'Запись...' : 'Сохранить сейчас'}</span>
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => pickAndBindExistingJsonFile()}
                      disabled={isSavingToPc}
                      className="font-semibold"
                    >
                      <FolderOpen size={14} />
                      <span>Сменить файл JSON</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={disconnectPcFile}
                      title="Отвязать файл"
                      className="text-xs text-[#8B93A1] hover:text-red-400"
                    >
                      <Unlink size={13} />
                      <span className="ml-1">Отвязать</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => pickAndBindExistingJsonFile()}
                      disabled={isSavingToPc}
                      className="font-semibold shadow-xs bg-indigo-600 hover:bg-indigo-500"
                    >
                      <FolderOpen size={14} />
                      <span>Выбрать файл JSON на ПК</span>
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => createAndBindNewJsonFile()}
                      disabled={isSavingToPc}
                      className="font-semibold"
                    >
                      <FilePlus2 size={14} />
                      <span>Создать новый .json на ПК</span>
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#242A33]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#8B93A1] gap-2">
              <div className="flex items-center gap-2">
                <FolderSync size={13} className="text-emerald-400" />
                <span>
                  {isFileSystemSupported
                    ? 'File System Access API: прямая запись в выбранный файл на жестком диске'
                    : 'Поддерживается прямое чтение и скачивание резервных копий JSON'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-indigo-300">
                Формат хранения: 100% автономный JSON
              </span>
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
                label="Первый день недели"
                value={startOfWeek}
                onChange={(e) => setStartOfWeek(e.target.value as 'monday' | 'sunday')}
              >
                <option value="monday">Понедельник (по умолчанию)</option>
                <option value="sunday">Воскресенье</option>
              </Select>

              <div className="flex flex-col justify-end">
                <div className="flex items-center gap-3">
                  <Button type="submit" variant="primary" size="md">
                    <Save size={16} />
                    <span>Сохранить настройки</span>
                  </Button>
                  {savedSuccess && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <Check size={14} /> Настройки обновлены
                    </span>
                  )}
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Manual Backup & Export */}
      <Card noPadding>
        <CardHeader
          title="Резервное копирование и экспорт"
          subtitle="Экспорт в JSON или восстановление базы данных из ранее сохраненного файла"
        />
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={handleDownloadBackup}
              className="flex-1"
            >
              <Download size={16} />
              <span>Скачать резервную копию (.json)</span>
            </Button>

            <div className="flex-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,application/json"
                className="hidden"
                id="restore-file-input"
              />
              <Button
                variant="secondary"
                size="md"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload size={16} />
                <span>Восстановить из файла JSON</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Tools & Data Management */}
      <Card noPadding>
        <CardHeader
          title="Системные операции и сброс"
          subtitle="Управление демонстрационными данными и синхронизация дат"
        />
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-[#11151B] border border-[#242A33] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[#F5F7FA]">
                Синхронизировать все даты на сегодня
              </div>
              <div className="text-xs text-[#8B93A1] mt-0.5">
                Автоматически переносит задачи, спринты и транзакции к текущему дню для демонстрации
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={realignDatesToToday}>
              <Calendar size={14} />
              <span>Сдвинуть даты на сегодня</span>
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-[#11151B] border border-[#242A33] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[#F5F7FA]">
                Сбросить на демонстрационные данные
              </div>
              <div className="text-xs text-[#8B93A1] mt-0.5">
                Заполняет систему готовым набором задач, проектов, целей и финансовых операций
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={resetToDemoData}>
              <RotateCcw size={14} />
              <span>Сбросить на демо-данные</span>
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-red-400">
                Полная очистка всех данных
              </div>
              <div className="text-xs text-[#8B93A1] mt-0.5">
                Удаляет все существующие записи: задачи, финансы, долги, цели и проекты
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={clearAllData}>
              <Trash2 size={14} />
              <span>Очистить все данные</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="p-4 rounded-xl bg-[#11151B] border border-[#242A33] flex items-center justify-between text-xs text-[#8B93A1]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-indigo-400" />
          <span>Professional Polish Theme • Real-Time PC Memory Sync • Client-Side Autonomous</span>
        </div>
        <div className="flex items-center gap-2">
          <Database size={13} />
          <span>Синхронизировано локально</span>
        </div>
      </div>
    </div>
  );
};
