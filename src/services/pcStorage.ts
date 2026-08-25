/**
 * Service for saving and synchronizing application data directly to the user's PC/computer.
 * Supports File System Access API (where available) with fallback to instant local file downloads.
 */

export interface PcFileHandleInfo {
  name: string;
  lastSavedAt: string;
  sizeBytes: number;
}

// In-memory reference to the active file handle
let activeFileHandle: any = null;

export const pcStorage = {
  /**
   * Check if the modern File System Access API is available in the current browser/environment
   */
  isFileSystemAccessSupported(): boolean {
    return typeof window !== 'undefined' && 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
  },

  /**
   * Get information about the currently connected file on the PC
   */
  getActiveFileInfo(): PcFileHandleInfo | null {
    if (!activeFileHandle) return null;
    return {
      name: activeFileHandle.name || 'connected-file.json',
      lastSavedAt: new Date().toISOString(),
      sizeBytes: 0,
    };
  },

  /**
   * Disconnect the active file handle
   */
  disconnectFile(): void {
    activeFileHandle = null;
  },

  /**
   * Save content directly to the user's PC.
   * If a file handle is already connected, writes to it directly.
   * Otherwise opens the save dialog, or triggers a direct download.
   */
  async saveToPc(
    content: string,
    suggestedName?: string
  ): Promise<{ success: boolean; fileName: string; method: 'filesystem' | 'download' }> {
    const defaultName = suggestedName || `planner_backup_${new Date().toISOString().slice(0, 10)}.json`;

    // Try File System Access API first
    if (this.isFileSystemAccessSupported()) {
      try {
        let handle = activeFileHandle;
        if (!handle) {
          handle = await (window as any).showSaveFilePicker({
            suggestedName: defaultName,
            types: [
              {
                description: 'JSON Backup Files',
                accept: {
                  'application/json': ['.json'],
                },
              },
              {
                description: 'All Files',
                accept: {
                  '*/*': ['.*'],
                },
              },
            ],
          });
          activeFileHandle = handle;
        }

        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();

        return {
          success: true,
          fileName: handle.name || defaultName,
          method: 'filesystem',
        };
      } catch (err: any) {
        // If user cancelled the picker dialog, do not force download
        if (err.name === 'AbortError') {
          return { success: false, fileName: '', method: 'filesystem' };
        }
        console.warn('File System Access API failed or restricted in iframe, falling back to download:', err);
      }
    }

    // Fallback: Direct instant browser download to PC Downloads/selected folder
    this.downloadAsFile(content, defaultName);
    return {
      success: true,
      fileName: defaultName,
      method: 'download',
    };
  },

  /**
   * Pick and open a JSON file directly from the user's PC
   */
  async loadFromPc(): Promise<{ success: boolean; content: string; fileName: string }> {
    if (this.isFileSystemAccessSupported()) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: 'JSON Backup Files',
              accept: {
                'application/json': ['.json'],
              },
            },
          ],
          multiple: false,
        });

        if (handle) {
          activeFileHandle = handle;
          const file = await handle.getFile();
          const text = await file.text();
          return {
            success: true,
            content: text,
            fileName: file.name,
          };
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return { success: false, content: '', fileName: '' };
        }
        console.warn('File System open failed, fallback to standard input:', err);
      }
    }

    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) {
          resolve({ success: false, content: '', fileName: '' });
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            success: true,
            content: (event.target?.result as string) || '',
            fileName: file.name,
          });
        };
        reader.onerror = () => {
          resolve({ success: false, content: '', fileName: '' });
        };
        reader.readAsText(file);
      };
      input.click();
    });
  },

  /**
   * Instant trigger for saving a file directly to the PC
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
