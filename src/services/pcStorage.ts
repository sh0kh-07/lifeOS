/**
 * Service for real-time automatic saving and syncing of application memory directly to a selected JSON file on the user's PC.
 * Uses the modern File System Access API with live handle writing and permission verification.
 */

// In-memory reference to the connected local file on the PC
let activeFileHandle: any = null;
let isWriting = false;
let pendingWriteContent: string | null = null;

export const pcStorage = {
  /**
   * Check if File System Access API is supported in current browser
   */
  isFileSystemAccessSupported(): boolean {
    return typeof window !== 'undefined' && 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
  },

  /**
   * Check if an active file handle is currently connected
   */
  hasConnectedFile(): boolean {
    return activeFileHandle !== null;
  },

  /**
   * Get name of the currently connected file on the PC
   */
  getConnectedFileName(): string | null {
    return activeFileHandle?.name || null;
  },

  /**
   * Verify and request readwrite permission if needed
   */
  async verifyWritePermission(handle: any): Promise<boolean> {
    if (!handle) return false;
    try {
      if (typeof handle.queryPermission === 'function') {
        const status = await handle.queryPermission({ mode: 'readwrite' });
        if (status === 'granted') return true;
        if (typeof handle.requestPermission === 'function') {
          const reqStatus = await handle.requestPermission({ mode: 'readwrite' });
          return reqStatus === 'granted';
        }
      }
      return true;
    } catch (e) {
      console.warn('Permission query error:', e);
      return true;
    }
  },

  /**
   * Select an EXISTING .json file on the PC, load its content, and bind for continuous real-time auto-saving.
   */
  async pickAndBindExistingFile(): Promise<{
    success: boolean;
    content: string;
    fileName: string;
    method: 'filesystem' | 'fallback';
  }> {
    if (this.isFileSystemAccessSupported()) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: 'JSON файл планировщика (*.json)',
              accept: {
                'application/json': ['.json'],
              },
            },
          ],
          multiple: false,
        });

        if (handle) {
          await this.verifyWritePermission(handle);
          activeFileHandle = handle;
          const file = await handle.getFile();
          const text = await file.text();

          return {
            success: true,
            content: text,
            fileName: file.name || 'data.json',
            method: 'filesystem',
          };
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return { success: false, content: '', fileName: '', method: 'filesystem' };
        }
        console.warn('File System open failed:', err);
      }
    }

    // Standard file input fallback (reads file, but cannot keep continuous handle in older browsers)
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) {
          resolve({ success: false, content: '', fileName: '', method: 'fallback' });
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            success: true,
            content: (event.target?.result as string) || '',
            fileName: file.name,
            method: 'fallback',
          });
        };
        reader.onerror = () => {
          resolve({ success: false, content: '', fileName: '', method: 'fallback' });
        };
        reader.readAsText(file);
      };
      input.click();
    });
  },

  /**
   * CREATE a NEW .json file on the user's PC and immediately bind it for continuous real-time auto-saving.
   */
  async createAndBindNewFile(initialContent: string, suggestedName?: string): Promise<{
    success: boolean;
    fileName: string;
    method: 'filesystem' | 'download';
  }> {
    const defaultName = suggestedName || `planner_data_${new Date().toISOString().slice(0, 10)}.json`;

    if (this.isFileSystemAccessSupported()) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: defaultName,
          types: [
            {
              description: 'JSON файл планировщика (*.json)',
              accept: {
                'application/json': ['.json'],
              },
            },
          ],
        });

        if (handle) {
          activeFileHandle = handle;
          await this.writeToActiveFile(initialContent);

          return {
            success: true,
            fileName: handle.name || defaultName,
            method: 'filesystem',
          };
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return { success: false, fileName: '', method: 'filesystem' };
        }
        console.warn('File save picker failed, fallback to download:', err);
      }
    }

    // Direct download fallback
    this.downloadAsFile(initialContent, defaultName);
    return {
      success: true,
      fileName: defaultName,
      method: 'download',
    };
  },

  /**
   * Write content directly into the bound PC file.
   * If another write operation is currently in flight, queues the latest content and writes immediately after.
   */
  async writeToActiveFile(content: string): Promise<boolean> {
    if (!activeFileHandle) return false;

    if (isWriting) {
      pendingWriteContent = content;
      return true;
    }

    isWriting = true;
    try {
      const writable = await activeFileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      isWriting = false;

      // Flush any newer update that occurred while writing
      if (pendingWriteContent !== null) {
        const nextContent = pendingWriteContent;
        pendingWriteContent = null;
        return await this.writeToActiveFile(nextContent);
      }

      return true;
    } catch (err) {
      console.warn('Real-time PC write error:', err);
      isWriting = false;
      pendingWriteContent = null;
      return false;
    }
  },

  /**
   * Disconnect the current file handle
   */
  disconnectFile(): void {
    activeFileHandle = null;
    pendingWriteContent = null;
  },

  /**
   * Direct download helper
   */
  downloadAsFile(content: string, fileName: string): void {
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  },
};
