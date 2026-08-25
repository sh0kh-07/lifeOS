import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  FileCode,
  FilePlus2,
  FolderOpen,
  HardDrive,
  Info,
  Save,
  Unlink,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

interface JsonFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JsonFileModal: React.FC<JsonFileModalProps> = ({ isOpen, onClose }) => {
  const {
    connectedPcFileName,
    lastSavedToPc,
    isSavingToPc,
    isFileSystemSupported,
    pickAndBindExistingJsonFile,
    createAndBindNewJsonFile,
    saveToPc,
    disconnectPcFile,
  } = useApp();

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePickFile = async () => {
    setIsProcessing(true);
    const success = await pickAndBindExistingJsonFile();
    setIsProcessing(false);
    if (success) {
      onClose();
    }
  };

  const handleCreateNewFile = async () => {
    setIsProcessing(true);
    const success = await createAndBindNewJsonFile();
    setIsProcessing(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-[#11151B] border border-[#242A33] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#242A33]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <HardDrive size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#F5F7FA]">
                Выбор файла JSON для автосохранения
              </h2>
              <p className="text-xs text-[#8B93A1]">
                Все данные будут сохраняться только в выбранный файл на вашем ПК
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B93A1] hover:text-[#F5F7FA] hover:bg-[#1C222B] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Current File Status */}
          <div className="p-4 rounded-xl bg-[#151A21] border border-[#242A33]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-medium text-[#8B93A1] uppercase tracking-wider">
                  Текущий статус:
                </span>
                {connectedPcFileName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-semibold text-emerald-400 font-mono">
                      {connectedPcFileName}
                    </span>
                  </div>
                ) : (
                  <div className="text-sm font-medium text-[#8B93A1] mt-1">
                    Файл JSON не выбран (данные пока сохраняются в локальную память браузера)
                  </div>
                )}
              </div>

              {connectedPcFileName && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md">
                  Активно
                </span>
              )}
            </div>

            {lastSavedToPc && connectedPcFileName && (
              <div className="mt-3 pt-3 border-t border-[#242A33] flex items-center justify-between text-xs text-[#8B93A1]">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Activity size={12} className="animate-pulse" />
                  Автосохранение в реальном времени
                </span>
                <span className="font-mono text-indigo-300">
                  Посл. запись: {lastSavedToPc}
                </span>
              </div>
            )}
          </div>

          {/* Action Options */}
          <div className="space-y-3">
            {/* Option 1: Pick existing JSON */}
            <button
              onClick={handlePickFile}
              disabled={isProcessing || isSavingToPc}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-[#151A21] hover:bg-[#1C222B] active:bg-[#202732] border border-indigo-500/40 hover:border-indigo-500 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 group-hover:scale-105 transition-transform shrink-0">
                  <FolderOpen size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#F5F7FA] group-hover:text-indigo-300 transition-colors">
                    Выбрать существующий файл .json на ПК
                  </div>
                  <p className="text-xs text-[#8B93A1] mt-0.5 leading-relaxed">
                    Откройте ваш готовый JSON-файл. Приложение загрузит из него данные и будет сохранять все дальнейшие изменения прямо в этот файл.
                  </p>
                </div>
              </div>
            </button>

            {/* Option 2: Create new JSON */}
            <button
              onClick={handleCreateNewFile}
              disabled={isProcessing || isSavingToPc}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-[#151A21] hover:bg-[#1C222B] active:bg-[#202732] border border-[#242A33] hover:border-emerald-500/50 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <FilePlus2 size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#F5F7FA] group-hover:text-emerald-300 transition-colors">
                    Создать новый файл .json на ПК
                  </div>
                  <p className="text-xs text-[#8B93A1] mt-0.5 leading-relaxed">
                    Выберите папку и имя на компьютере — приложение создаст новый файл и привяжет его для непрерывного сохранения.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Explanation banner */}
          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-2.5 text-xs text-indigo-300">
            <Info size={16} className="shrink-0 mt-0.5 text-indigo-400" />
            <p className="leading-relaxed">
              <strong>Как это работает:</strong> браузер связывается с файлом на вашем диске через File System API. При любом клике (создание задачи, чекбокс, транзакция, долг) данные моментально записываются в ваш .json файл без необходимости нажимать кнопку сохранения.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0D1015] border-t border-[#242A33]">
          {connectedPcFileName ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                disconnectPcFile();
                onClose();
              }}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Unlink size={13} />
              <span>Отвязать файл</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {connectedPcFileName && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => saveToPc()}
                disabled={isSavingToPc}
              >
                <Save size={14} />
                <span>{isSavingToPc ? 'Запись...' : 'Сохранить сейчас'}</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
