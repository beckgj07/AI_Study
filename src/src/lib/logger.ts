// Simple file-based logger for the application

import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function formatDate(date: Date): string {
  return date.toISOString();
}

function writeLog(level: string, message: string, meta?: Record<string, unknown>) {
  try {
    ensureLogDir();
    const timestamp = formatDate(new Date());
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    const logLine = `[${timestamp}] [${level}] ${message}${metaStr}\n`;
    fs.appendFileSync(LOG_FILE, logLine, 'utf-8');
  } catch (error) {
    console.error('Failed to write log:', error);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    writeLog('INFO', message, meta);
    console.log(`[INFO] ${message}`, meta || '');
  },

  warn: (message: string, meta?: Record<string, unknown>) => {
    writeLog('WARN', message, meta);
    console.warn(`[WARN] ${message}`, meta || '');
  },

  error: (message: string, meta?: Record<string, unknown>) => {
    writeLog('ERROR', message, meta);
    console.error(`[ERROR] ${message}`, meta || '');
  },

  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production') {
      writeLog('DEBUG', message, meta);
      console.log(`[DEBUG] ${message}`, meta || '');
    }
  },

  // Get recent logs
  getRecentLogs: (lines: number = 100): string[] => {
    try {
      if (!fs.existsSync(LOG_FILE)) return [];
      const content = fs.readFileSync(LOG_FILE, 'utf-8');
      const allLines = content.split('\n').filter(Boolean);
      return allLines.slice(-lines);
    } catch {
      return [];
    }
  },

  // Get logs by level
  getLogsByLevel: (level: string): string[] => {
    try {
      if (!fs.existsSync(LOG_FILE)) return [];
      const content = fs.readFileSync(LOG_FILE, 'utf-8');
      return content.split('\n').filter(l => l.includes(`[${level}]`));
    } catch {
      return [];
    }
  }
};

export default logger;
