export class ServiceProvider<T> {
  private readonly service: T;

  constructor(Mock: { new (): T }, Default: { new (backendUrl: string): T }) {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    if (backendUrl === 'mock') {
      this.service = new Mock();
    } else if (backendUrl) {
      this.service = new Default(backendUrl);
    } else {
      throw Error('No backend service configured for this environment!');
    }
  }

  get(): T {
    return this.service;
  }
}
