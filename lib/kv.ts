import { createClient } from '@vercel/kv';

const memoryStore = new Map<string, any>();

class MockKV {
  async get<T>(key: string): Promise<T | null> {
    const val = memoryStore.get(key);
    return val !== undefined ? (JSON.parse(JSON.stringify(val)) as T) : null;
  }
  async set(key: string, value: any): Promise<'OK'> {
    memoryStore.set(key, value);
    return 'OK';
  }
}

export const kv = (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  ? createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : new MockKV() as any;

export const keys = {
  contacts: (evmAddress: string) => `voz:contacts:${evmAddress.toLowerCase()}`,
  transfer: (id: string) => `voz:transfer:${id}`,
  audio: (id: string) => `voz:audio:${id}`,
};
