export interface TextContentService {
  get(name: string): Promise<string>;
}

export class DefaultTextContentService implements TextContentService {
  private readonly url: string;

  constructor() {
    if (process.env.REACT_APP_BACKEND_URL) {
      this.url = process.env.REACT_APP_BACKEND_URL;
    } else {
      throw Error(
        'No default generation service configured for this ' + 'environment.',
      );
    }
  }

  async get(name: string): Promise<string> {
    const response = await fetch(this.url + '/data/text_content/' + name);
    return response.json();
  }
}
