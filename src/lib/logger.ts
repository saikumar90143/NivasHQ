type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  [key: string]: any;
}

const isProduction = process.env.NODE_ENV === 'production';

function formatLog(payload: LogPayload): string {
  if (isProduction) {
    return JSON.stringify(payload);
  }

  const { level, message, timestamp, requestId, ...context } = payload;
  let formattedMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  
  if (requestId) {
    formattedMessage += ` [ReqId: ${requestId}]`;
  }
  
  if (Object.keys(context).length > 0) {
    formattedMessage += ` ${JSON.stringify(context)}`;
  }

  return formattedMessage;
}

function createLogger(baseContext: Record<string, any> = {}) {
  const log = (level: LogLevel, message: string, context?: Record<string, any>) => {
    const payload: LogPayload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...baseContext,
      ...context,
    };

    const formatted = formatLog(payload);

    switch (level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  };

  return {
    debug: (message: string, context?: Record<string, any>) => log('debug', message, context),
    info: (message: string, context?: Record<string, any>) => log('info', message, context),
    warn: (message: string, context?: Record<string, any>) => log('warn', message, context),
    error: (message: string, context?: Record<string, any>) => log('error', message, context),
    withRequestId: (requestId: string) => createLogger({ ...baseContext, requestId }),
  };
}

export const logger = createLogger();
