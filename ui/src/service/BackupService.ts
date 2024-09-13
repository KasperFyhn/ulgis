import { DefaultServiceBase } from './ServiceBase';
import { ServiceProvider } from './ServiceProvider';

export interface BackupService {
  create(name: string, token: string): Promise<void>;

  delete(nameAndTimestamp: string, token: string): Promise<void>;

  restore(nameAndTimestamp: string, token: string): Promise<void>;

  list(token: string): Promise<string[]>;
}

class MockBackupService implements BackupService {
  private backups: string[] = ['old@' + new Date('2024').toISOString()];

  async create(name: string): Promise<void> {
    this.backups.push(name + '@' + new Date().toISOString());
  }

  async delete(nameAndTimestamp: string): Promise<void> {
    const idx = this.backups.findIndex((b) => b === nameAndTimestamp);
    this.backups.splice(idx, 1);
  }

  async restore(): Promise<void> {
    await Promise.resolve();
  }

  list(): Promise<string[]> {
    return Promise.resolve([...this.backups]);
  }
}

class DefaultBackupService extends DefaultServiceBase implements BackupService {
  async create(name: string, token: string): Promise<void> {
    return fetch(this.url + 'backup/create/' + name, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    }).then((r) => {
      if (r.ok) {
        return;
      } else {
        throw new Error('Failed to create');
      }
    });
  }

  async delete(nameAndTimestamp: string, token: string): Promise<void> {
    return fetch(this.url + 'backup/delete/' + nameAndTimestamp, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    }).then((r) => {
      if (r.ok) {
        return;
      } else {
        throw new Error('Failed to delete');
      }
    });
  }

  async list(token: string): Promise<string[]> {
    return fetch(this.url + 'backup/list', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    }).then((response) => response.json());
  }

  async restore(nameAndTimestamp: string, token: string): Promise<void> {
    await fetch(this.url + 'backup/restore/' + nameAndTimestamp, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    }).then((r) => {
      if (r.ok) {
        return;
      } else {
        throw new Error('Failed to restore');
      }
    });
  }
}

const provider = new ServiceProvider<BackupService>(
  MockBackupService,
  DefaultBackupService,
);

export function getBackupService(): BackupService {
  return provider.get();
}
