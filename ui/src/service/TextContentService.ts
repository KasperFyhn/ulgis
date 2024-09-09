export interface TextContentService {
  get(name: string): Promise<string>;
}

export class DefaultTextContentService implements TextContentService {
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async get(name: string): Promise<string> {
    const response = await fetch(this.url + '/data/text_content/' + name);
    return response.json();
  }
}

class MockTextContentService implements TextContentService {
  get(name: string): Promise<string> {
    return Promise.resolve(
      'This text content is from a mock text content service, retrieved with ' +
        'the fetch key "' +
        name +
        '".',
    );
  }
}

export function getTextContentService(): TextContentService {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  if (backendUrl === 'mock') {
    return new MockTextContentService();
  } else if (backendUrl) {
    return new DefaultTextContentService(backendUrl);
  } else {
    throw Error('No text content service configured for this environment!');
  }
}
