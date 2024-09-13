import { DefaultServiceBase } from './ServiceBase';
import { ServiceProvider } from './ServiceProvider';

export interface TextContentItem {
  name: string;
  text: string;
}

export interface TextContentService {
  getAll(): Promise<TextContentItem[]>;

  get(name: string): Promise<string>;

  put(name: string, text: string, token: string): Promise<void>;
}

class DefaultTextContentService
  extends DefaultServiceBase
  implements TextContentService
{
  async getAll(): Promise<TextContentItem[]> {
    const response = await fetch(this.url + 'data/text_content');
    return await response.json();
  }

  async put(name: string, text: string, token: string): Promise<void> {
    return fetch(this.url + 'data/text_content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ name: name, text: text }),
    }).then((r) => {
      if (r.ok) {
        return;
      } else {
        throw new Error('Failed to delete taxonomy');
      }
    });
  }

  async get(name: string): Promise<string> {
    const response = await fetch(this.url + 'data/text_content/' + name);
    return response.json();
  }
}

class MockTextContentService implements TextContentService {
  private textContent: TextContentItem[] = [
    {
      name: 'First',
      text: 'Some text',
    },
    {
      name: 'Second',
      text: '# Header\n\nSome other text',
    },
  ];

  getAll(): Promise<TextContentItem[]> {
    return Promise.resolve([...this.textContent]);
  }

  async put(name: string, text: string): Promise<void> {
    const textContentItem = this.textContent.find((t) => t.name === name);
    if (textContentItem) {
      textContentItem.text = text;
    } else {
      throw Error('Failed to put text');
    }
  }

  get(name: string): Promise<string> {
    return Promise.resolve(
      'This text content is from a mock text content service, retrieved with ' +
        'the fetch key "' +
        name +
        '".',
    );
  }
}

const provider = new ServiceProvider<TextContentService>(
  MockTextContentService,
  DefaultTextContentService,
);

export function getTextContentService(): TextContentService {
  return provider.get();
}
