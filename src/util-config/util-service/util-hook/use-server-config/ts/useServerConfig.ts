import { useEffect, useState } from 'react';
import { configService } from '@api/ApiService';
import type { ServerConfig } from '@type/type-model/ts/Model.type';

/** Until the server answers, assume SMS is off (phone options appear once it's confirmed) */
const FALLBACK: ServerConfig = { sms: false };

let cached: ServerConfig | null = null;
let request: Promise<ServerConfig> | null = null;

function loadConfig() {
  request ??= configService
    .get()
    .then((c) => (cached = c))
    .catch(() => {
      request = null; // try again next time a page needs it
      return FALLBACK;
    });
  return request;
}

/** Public server settings, fetched once per page load: e.g. whether text messages can be sent */
export function useServerConfig(): ServerConfig {
  const [config, setConfig] = useState<ServerConfig>(cached ?? FALLBACK);
  useEffect(() => {
    if (cached) return;
    let alive = true;
    void loadConfig().then((c) => alive && setConfig(c));
    return () => {
      alive = false;
    };
  }, []);
  return config;
}
