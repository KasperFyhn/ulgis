export class DefaultServiceBase {
  protected readonly url: string;

  constructor(url: string) {
    if (!url.endsWith('/')) {
      url += '/';
    }
    this.url = url;
  }
}
