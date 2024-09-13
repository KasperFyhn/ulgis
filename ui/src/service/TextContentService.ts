import { DefaultServiceBase } from './ServiceBase';
import { ServiceProvider } from './ServiceProvider';

export interface TextContentService {
  get(name: string): Promise<string>;
}

class DefaultTextContentService
  extends DefaultServiceBase
  implements TextContentService
{
  async get(name: string): Promise<string> {
    const response = await fetch(this.url + 'data/text_content/' + name);
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

const provider = new ServiceProvider<TextContentService>(
  MockTextContentService,
  DefaultTextContentService,
);

export function getTextContentService(): TextContentService {
  return provider.get();
}
