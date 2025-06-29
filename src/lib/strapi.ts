import axios from 'axios';
import qs from 'qs';

// Получаем переменные окружения
const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN;

console.log('Strapi URL:', STRAPI_URL);
console.log('Strapi Token:', STRAPI_TOKEN ? 'Установлен' : 'Не установлен');

// Создаем экземпляр axios с базовой конфигурацией
const strapiApi = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
  },
  timeout: 5000, // Уменьшен таймаут для быстрого fallback
});

// Добавляем интерцептор для логирования ошибок
strapiApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Strapi API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Типы для Strapi данных
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiEntity {
  id: number;
  attributes: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface StrapiImage {
  id: number;
  attributes: {
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    formats?: Record<string, any>;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl?: string;
    provider: string;
    provider_metadata?: any;
    createdAt: string;
    updatedAt: string;
  };
}

// Функции для работы с API
export class StrapiService {
  // Проверка доступности Strapi
  static async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${STRAPI_URL}/api/technologies?pagination[limit]=1`, { 
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json',
          ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
        }
      });
      console.log('Strapi connection successful');
      return true;
    } catch (error) {
      console.log('Strapi недоступен, используем локальные данные');
      return false;
    }
  }

  // Получение всех записей коллекции
  static async getCollection<T>(
    collection: string,
    options: {
      populate?: string | string[] | Record<string, any>;
      filters?: Record<string, any>;
      sort?: string | string[];
      pagination?: {
        page?: number;
        pageSize?: number;
        start?: number;
        limit?: number;
      };
      publicationState?: 'live' | 'preview';
    } = {}
  ): Promise<StrapiResponse<StrapiEntity[]>> {
    try {
      console.log(`Fetching ${collection} from Strapi...`);
      
      const query = qs.stringify(
        {
          populate: options.populate || '*',
          filters: options.filters,
          sort: options.sort,
          pagination: options.pagination,
          publicationState: options.publicationState || 'live',
        },
        { encodeValuesOnly: true }
      );

      const response = await strapiApi.get(`/${collection}?${query}`);
      console.log(`Successfully fetched ${collection}:`, response.data.data?.length || 0, 'items');
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${collection}:`, error.message);
      throw error;
    }
  }

  // Получение одной записи по ID
  static async getEntry<T>(
    collection: string,
    id: number | string,
    options: {
      populate?: string | string[] | Record<string, any>;
    } = {}
  ): Promise<{ data: StrapiEntity }> {
    try {
      const query = qs.stringify(
        {
          populate: options.populate || '*',
        },
        { encodeValuesOnly: true }
      );

      const response = await strapiApi.get(`/${collection}/${id}?${query}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${collection} entry ${id}:`, error.message);
      throw error;
    }
  }

  // Получение записи по slug
  static async getEntryBySlug<T>(
    collection: string,
    slug: string,
    options: {
      populate?: string | string[] | Record<string, any>;
    } = {}
  ): Promise<StrapiEntity | null> {
    try {
      const query = qs.stringify(
        {
          filters: { slug: { $eq: slug } },
          populate: options.populate || '*',
          publicationState: 'live',
        },
        { encodeValuesOnly: true }
      );

      const response = await strapiApi.get(`/${collection}?${query}`);
      const data = response.data.data;
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(`Error fetching ${collection} by slug ${slug}:`, error.message);
      return null;
    }
  }

  // Получение рекомендуемых записей
  static async getFeaturedEntries<T>(
    collection: string,
    limit: number = 3,
    options: {
      populate?: string | string[] | Record<string, any>;
    } = {}
  ): Promise<StrapiEntity[]> {
    try {
      const query = qs.stringify(
        {
          filters: { featured: { $eq: true } },
          populate: options.populate || '*',
          pagination: { limit },
          publicationState: 'live',
        },
        { encodeValuesOnly: true }
      );

      const response = await strapiApi.get(`/${collection}?${query}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching featured ${collection}:`, error.message);
      // Если нет featured записей, возвращаем обычные
      try {
        const fallbackQuery = qs.stringify(
          {
            populate: options.populate || '*',
            pagination: { limit },
            publicationState: 'live',
          },
          { encodeValuesOnly: true }
        );
        const fallbackResponse = await strapiApi.get(`/${collection}?${fallbackQuery}`);
        return fallbackResponse.data.data || [];
      } catch (fallbackError) {
        return [];
      }
    }
  }

  // Получение URL изображения
  static getImageUrl(image: StrapiImage | null, format: string = 'medium'): string {
    if (!image) return '';
    
    const { url, formats } = image.attributes;
    
    // Если есть форматы и запрашиваемый формат существует
    if (formats && formats[format]) {
      return `${STRAPI_URL}${formats[format].url}`;
    }
    
    // Возвращаем оригинальное изображение
    return `${STRAPI_URL}${url}`;
  }

  // Преобразование Strapi entity в простой объект
  static transformEntity<T>(entity: StrapiEntity): T & { id: number; slug?: string } {
    return {
      id: entity.id,
      ...entity.attributes,
    } as T & { id: number; slug?: string };
  }

  // Преобразование массива entities
  static transformEntities<T>(entities: StrapiEntity[]): (T & { id: number; slug?: string })[] {
    return entities.map(entity => this.transformEntity<T>(entity));
  }
}

// Специфичные функции для каждой коллекции
export const TechnologiesAPI = {
  getAll: (options = {}) => StrapiService.getCollection('technologies', options),
  getBySlug: (slug: string) => StrapiService.getEntryBySlug('technologies', slug),
  getFeatured: (limit = 6) => StrapiService.getFeaturedEntries('technologies', limit),
};

export const ProjectsAPI = {
  getAll: (options = {}) => StrapiService.getCollection('projects', options),
  getBySlug: (slug: string) => StrapiService.getEntryBySlug('projects', slug),
  getFeatured: (limit = 3) => StrapiService.getFeaturedEntries('projects', limit),
  getByStatus: (status: string) => StrapiService.getCollection('projects', {
    filters: { status: { $eq: status } }
  }),
};

export const ArticlesAPI = {
  getAll: (options = {}) => StrapiService.getCollection('articles', {
    sort: ['createdAt:desc'],
    ...options
  }),
  getBySlug: (slug: string) => StrapiService.getEntryBySlug('articles', slug),
  getFeatured: (limit = 3) => StrapiService.getFeaturedEntries('articles', limit),
  getRecent: (limit = 6) => StrapiService.getCollection('articles', {
    sort: ['createdAt:desc'],
    pagination: { limit }
  }),
};

export const EquipmentAPI = {
  getAll: (options = {}) => StrapiService.getCollection('equipment', options),
  getBySlug: (slug: string) => StrapiService.getEntryBySlug('equipment', slug),
  getFeatured: (limit = 4) => StrapiService.getFeaturedEntries('equipment', limit),
  getByCategory: (category: string) => StrapiService.getCollection('equipment', {
    filters: { category: { $eq: category } }
  }),
  getAvailable: () => StrapiService.getCollection('equipment', {
    filters: { available: { $eq: true } }
  }),
};

export default StrapiService;