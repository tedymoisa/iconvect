export function createLogger() {
  const isProduction = process.env.NODE_ENV === "production";
  const isClientSide = typeof window !== "undefined";
  const environmentTag = isClientSide ? "[Client]" : "[Server]";

  const getFormattedTimestamp = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  const log = (level: "info" | "warn" | "error", ...args: unknown[]): void => {
    if (isProduction && level === "info") {
      return;
    }

    const timestamp = getFormattedTimestamp();
    const levelTag = `[${level.toUpperCase()}]`;

    if (isClientSide) {
      let levelColor = "inherit";
      switch (level) {
        case "info":
          levelColor = "dodgerblue";
          break;
        case "warn":
          levelColor = "orange";
          break;
        case "error":
          levelColor = "red";
          break;
      }

      const metaStyle = "color: gray; font-weight: lighter; margin-right: 4px;";
      const envStyle = "color: green; font-weight: bold; margin-right: 4px;";
      const levelStyle = `color: ${levelColor}; font-weight: bold; margin-right: 6px;`;
      const messageStyle = "color: inherit;";

      console[level](
        `%c${timestamp}%c${environmentTag}%c${levelTag}%c`,
        metaStyle,
        envStyle,
        levelStyle,
        messageStyle,
        ...args
      );
    } else {
      console[level](timestamp, environmentTag, levelTag, ...args);
    }
  };

  return {
    info: (...args: unknown[]): void => log("info", ...args),
    warn: (...args: unknown[]): void => log("warn", ...args),
    error: (...args: unknown[]): void => log("error", ...args)
  };
}

export type LoggerInstance = ReturnType<typeof createLogger>;

export const logger: LoggerInstance = createLogger();
