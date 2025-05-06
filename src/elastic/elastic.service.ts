import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PrismaService } from 'src/prisma/prisma.service';
import { IProductWithBrand } from '../common/types/types';

@Injectable()
export class ElasticService implements OnModuleInit {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly prisma: PrismaService,
  ) {}

  private readonly PRODUCTS_WITH_BRANDS_INDEX = 'products-with-brands';

  async createIndexProductsWithBrands() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.PRODUCTS_WITH_BRANDS_INDEX,
      });

      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index: this.PRODUCTS_WITH_BRANDS_INDEX,

          settings: {
            analysis: {
              analyzer: {
                edge_ngram_analyzer: {
                  type: 'custom',
                  tokenizer: 'edge_ngram_tokenizer',
                },
              },
              tokenizer: {
                edge_ngram_tokenizer: {
                  type: 'edge_ngram',
                  min_gram: 1,
                  max_gram: 20,
                  token_chars: ['letter', 'digit'],
                },
              },
            },
          },
          mappings: {
            properties: {
              title: {
                type: 'text',
                analyzer: 'edge_ngram_analyzer',
              },
              description: {
                type: 'text',
              },
              brand: {
                properties: {
                  title: {
                    type: 'text',
                  },
                },
              },
            },
          },
        });
        console.log('Index created successfully');
      }
    } catch (error) {
      console.error('Error creating index:', error);
      throw error;
    }
  }

  async deleteIndexProductsWithBrands() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.PRODUCTS_WITH_BRANDS_INDEX,
      });
      if (indexExists) {
        await this.elasticsearchService.indices.delete({
          index: this.PRODUCTS_WITH_BRANDS_INDEX,
        });
        console.log('Index deleted successfully');
      }
    } catch (error) {
      console.log('Error while deleting index:', error);
    }
  }

  async indexProductWithBrand(product: IProductWithBrand) {
    await this.elasticsearchService.index({
      index: this.PRODUCTS_WITH_BRANDS_INDEX,
      body: {
        title: product.title,
        description: product.description,
        brand: product.brand,
      },
    });
  }

  async indexAllProductsWithBrands() {
    const products = await this.prisma.product.findMany({
      include: { Brand: true },
    });

    for (const product of products) {
      await this.indexProductWithBrand({
        id: product.id,
        title: product.title,
        description: product.description || '',
        brand: {
          title: product.Brand?.title || '',
        },
      });
    }
  }

  async onModuleInit() {
    await this.deleteIndexProductsWithBrands();
    await this.createIndexProductsWithBrands();
    await this.indexAllProductsWithBrands();
  }

  // async searchProductsWithBrands(query: string) {
  //   const result = await this.elasticsearchService.search({
  //     index: this.PRODUCTS_WITH_BRANDS_INDEX,
  //     query: {
  //       bool: {
  //         should: [
  //           { match: { title: query } },
  //           { match_phrase_prefix: { description: query } },
  //           { match_phrase_prefix: { 'brand.title': query } },
  //         ],
  //       },
  //     },
  //   });

  //   return result.hits.hits.map((hit: any) => hit._source);
  // }
  async searchProductsWithBrands(query: string) {
    const result = await this.elasticsearchService.search({
      index: this.PRODUCTS_WITH_BRANDS_INDEX,
      query: {
        bool: {
          should: [
            {
              match: {
                title: {
                  query: query,
                  fuzziness: 'AUTO', // Автоматичний вибір відстані (1-2 символи)
                  operator: 'and', // Всі слова повинні збігатися
                  boost: 2, // Підвищена вага для title
                },
              },
            },
            {
              multi_match: {
                query: query,
                fields: ['description', 'brand.title'],
                fuzziness: 1, // Дозволити 1 помилку
                prefix_length: 2, // Перші 2 символи повинні точно збігатися
                type: 'best_fields', // Використовувати найкращі збіги
              },
            },
            {
              wildcard: {
                title: {
                  value: `*${query}*`, // Пошук зі зірочками
                  case_insensitive: true,
                },
              },
            },
          ],
          minimum_should_match: 1, // Хоча б одна умова повинна виконуватися
        },
      },
      // Додаткові параметри для покращення результатів
      suggest: {
        text: query,
        title_suggestion: {
          term: {
            field: 'title',
            suggest_mode: 'popular', // Враховувати популярні варіанти
            max_edits: 2, // Максимальна кількість редагувань
          },
        },
      },
    });

    // Об'єднання результатів пошуку і підказок
    const hits = result.hits.hits.map((hit: any) => hit._source);
    const suggestions = result.suggest?.title_suggestion[0]?.options || [];

    return { hits, suggestions };
  }

  async getIndices() {
    return await this.elasticsearchService.cat.indices({
      format: 'json',
    });
  }
}
