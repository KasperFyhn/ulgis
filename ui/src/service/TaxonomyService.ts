import { DefaultServiceBase } from './ServiceBase';
import { UiLevel } from '../generate/models';
import { ServiceProvider } from './ServiceProvider';

export interface ParameterItem {
  id?: number;
  name: string;
  shortDescription: string;
}

export interface TaxonomyItem {
  id?: number;
  name: string;
  shortDescription: string;
  text: string;
  uiLevel: UiLevel;
  priority: number;
  group: ParameterItem[];
}

export interface TaxonomyService {
  getTaxonomies(): Promise<TaxonomyItem[]>;

  putOrUpdateTaxonomy(taxonomy: TaxonomyItem, token: string): Promise<void>;

  deleteTaxonomy(id: string | number, token: string): Promise<void>;
}

export class MockTaxonomiesService implements TaxonomyService {
  private taxonomies: TaxonomyItem[] = [
    {
      id: 0,
      name: 'Some taxonomy',
      shortDescription: 'Cool taxonomy',
      text: 'Really cool text too',
      uiLevel: 'Modular',
      priority: 5,
      group: [
        {
          name: 'Param 1',
          shortDescription: 'Param 1',
        },
        {
          name: 'Param 2',
          shortDescription: 'Param 2',
        },
      ],
    },
  ];

  getTaxonomies(): Promise<TaxonomyItem[]> {
    return Promise.resolve([...this.taxonomies]);
  }

  async putOrUpdateTaxonomy(taxonomy: TaxonomyItem): Promise<void> {
    if (taxonomy.id !== undefined) {
      const existingIndex = this.taxonomies.findIndex(
        (t) => t.id === taxonomy.id,
      );
      this.taxonomies[existingIndex] = taxonomy;
    } else {
      taxonomy.id = this.taxonomies.length;
      this.taxonomies.push(taxonomy);
    }
  }

  async deleteTaxonomy(id: string | number): Promise<void> {
    const existingIndex = this.taxonomies.findIndex((t) => t.id === id);
    this.taxonomies.splice(existingIndex, 1);
  }
}

export class DefaultTaxonomiesService
  extends DefaultServiceBase
  implements TaxonomyService
{
  async getTaxonomies(): Promise<TaxonomyItem[]> {
    return fetch(this.url + 'data/taxonomies').then((response) =>
      response.json(),
    );
  }

  async putOrUpdateTaxonomy(
    taxonomy: TaxonomyItem,
    token: string,
  ): Promise<void> {
    return fetch(this.url + 'data/taxonomies', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(taxonomy),
    }).then((r) => {
      if (r.ok) {
        return;
      } else {
        throw new Error('Failed to delete taxonomy');
      }
    });
  }

  async deleteTaxonomy(id: string | number, token: string): Promise<void> {
    return fetch(this.url + 'data/taxonomies/' + id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    }).then((r) => {
      if (r.ok) {
        return;
      } else {
        throw new Error('Failed to delete taxonomy');
      }
    });
  }
}

const provider = new ServiceProvider<TaxonomyService>(
  MockTaxonomiesService,
  DefaultTaxonomiesService,
);

export function getTaxonomyService(): TaxonomyService {
  return provider.get();
}
