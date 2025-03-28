import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { URLSearchParams } from 'url';
import https from 'https';

export interface ObsidianConfig {
  apiKey: string;
  protocol?: string;
  host?: string;
  port?: number;
  verifySSL?: boolean;
}

export class Obsidian {
  private apiKey: string;
  private protocol: string;
  private host: string;
  private port: number;
  private verifySSL: boolean;
  private client: AxiosInstance;

  constructor({
    apiKey,
    protocol = 'https',
    host = '127.0.0.1',
    port = 27124,
    verifySSL = false,
  }: ObsidianConfig) {
    this.apiKey = apiKey;
    this.protocol = protocol;
    this.host = host;
    this.port = port;
    this.verifySSL = verifySSL;

    this.client = axios.create({
      baseURL: this.getBaseUrl(),
      headers: this.getHeaders(),
      validateStatus: null,
      httpsAgent: verifySSL ? undefined : new https.Agent({ rejectUnauthorized: false }),
      timeout: 6000,
    });
  }

  private getBaseUrl(): string {
    return `${this.protocol}://${this.host}:${this.port}`;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  private async safeCall<T>(fn: () => Promise<AxiosResponse>): Promise<T> {
    try {
      const response = await fn();
      
      if (response.status >= 400) {
        const errorData = response.data || {};
        const code = errorData.errorCode || -1;
        const message = errorData.message || '<unknown>';
        throw new Error(`Error ${code}: ${message}`);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Request failed: ${error.message}`);
      }
      throw error;
    }
  }

  async listFilesInVault(): Promise<any> {
    return this.safeCall<any>(async () => {
      const response = await this.client.get('/vault/');
      return response;
    }).then(data => data.files);
  }

  async listFilesInDir(dirpath: string): Promise<any> {
    return this.safeCall<any>(async () => {
      const response = await this.client.get(`/vault/${dirpath}/`);
      return response;
    }).then(data => data.files);
  }

  async getFileContents(filepath: string): Promise<string> {
    return this.safeCall<string>(async () => {
      const response = await this.client.get(`/vault/${filepath}`);
      return response;
    });
  }

  async getBatchFileContents(filepaths: string[]): Promise<string> {
    const results: string[] = [];

    for (const filepath of filepaths) {
      try {
        const content = await this.getFileContents(filepath);
        results.push(`# ${filepath}\n\n${content}\n\n---\n\n`);
      } catch (error) {
        results.push(`# ${filepath}\n\nError reading file: ${error instanceof Error ? error.message : String(error)}\n\n---\n\n`);
      }
    }

    return results.join('');
  }

  async search(query: string, contextLength: number = 100): Promise<any> {
    return this.safeCall<any>(async () => {
      const response = await this.client.post('/search/simple/', null, {
        params: {
          query,
          contextLength
        }
      });
      return response;
    });
  }

  async appendContent(filepath: string, content: string): Promise<void> {
    return this.safeCall<void>(async () => {
      const response = await this.client.post(
        `/vault/${filepath}`,
        content,
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'text/markdown'
          }
        }
      );
      return response;
    });
  }

  async patchContent(
    filepath: string, 
    operation: 'append' | 'prepend' | 'replace',
    targetType: 'heading' | 'block' | 'frontmatter',
    target: string,
    content: string
  ): Promise<void> {
    return this.safeCall<void>(async () => {
      const response = await this.client.patch(
        `/vault/${filepath}`,
        content,
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'text/markdown',
            'Operation': operation,
            'Target-Type': targetType,
            'Target': encodeURIComponent(target)
          }
        }
      );
      return response;
    });
  }

  async searchJson(query: Record<string, any>): Promise<any> {
    return this.safeCall<any>(async () => {
      const response = await this.client.post(
        '/search/',
        query,
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/vnd.olrapi.jsonlogic+json'
          }
        }
      );
      return response;
    });
  }
} 