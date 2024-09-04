export interface AuthenticationService {
  getToken(username: string, password: string): Promise<string>;

  getCurrentUser(token: string): Promise<string>;
}

export class DefaultAuthenticationService implements AuthenticationService {
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async getToken(username: string, password: string): Promise<string> {
    const response = await fetch(this.url + '/auth/token', {
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

  async getCurrentUser(token: string): Promise<string> {
    const response = await fetch(this.url + '/auth/current_user', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    }).then((r) => {
      if (r.ok) {
        return r.json();
      } else {
        return undefined;
      }
    });

    return await response;
  }
}

class MockAuthenticationService implements AuthenticationService {
  getCurrentUser(token: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  getToken(name: string): Promise<string> {
    return Promise.resolve(
      'This text content is from a mock text content service, retrieved with ' +
        'the fetch key "' +
        name +
        '".',
    );
  }
}

export function getAuthenticationService(): AuthenticationService {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  if (backendUrl === 'mock') {
    return new MockAuthenticationService();
  } else if (backendUrl) {
    return new DefaultAuthenticationService(backendUrl);
  } else {
    throw Error('No text content service configured for this environment!');
  }
}
