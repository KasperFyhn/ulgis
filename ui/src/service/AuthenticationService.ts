import { DefaultServiceBase } from './ServiceBase';
import { ServiceProvider } from './ServiceProvider';

export interface AuthenticationService {
  getToken(username: string, password: string): Promise<string>;

  getCurrentUser(token: string): Promise<string | null>;
}

class DefaultAuthenticationService
  extends DefaultServiceBase
  implements AuthenticationService
{
  async getToken(username: string, password: string): Promise<string> {
    const response = await fetch(this.url + 'auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ username, password }),
    });

    if (!response.ok) {
      const errorDetail = await response.json();
      throw new Error(errorDetail.detail || 'Login failed');
    }

    const data = await response.json();
    return data['access_token'];
  }

  async getCurrentUser(token: string): Promise<string | null> {
    return fetch(this.url + 'auth/current_user', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    }).then((r) => {
      if (r.ok) {
        return r.json();
      } else {
        return null;
      }
    });
  }
}

class MockAuthenticationService implements AuthenticationService {
  getCurrentUser(token: string): Promise<string> {
    return Promise.resolve(token.replace('FAKE_TOKEN_FOR:', 'FAKE_USER:'));
  }

  getToken(name: string): Promise<string> {
    const fakeToken = 'FAKE_TOKEN_FOR:' + name;
    return Promise.resolve(fakeToken);
  }
}

const provider = new ServiceProvider<AuthenticationService>(
  MockAuthenticationService,
  DefaultAuthenticationService,
);

export function getAuthenticationService(): AuthenticationService {
  return provider.get();
}
