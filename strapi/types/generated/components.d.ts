import type { Schema, Struct } from '@strapi/strapi';

export interface EquipmentItemSpecifications extends Struct.ComponentSchema {
  collectionName: 'components_equipment_specifications';
  info: {
    description: '\u0422\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438 \u0442\u0435\u0445\u043D\u0438\u043A\u0438';
    displayName: '\u0422\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438';
  };
  attributes: {
    capacity: Schema.Attribute.String;
    dimensions: Schema.Attribute.String;
    fuelConsumption: Schema.Attribute.String;
    maxDepth: Schema.Attribute.String;
    power: Schema.Attribute.String;
    weight: Schema.Attribute.String;
    workingWidth: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'SEO \u043C\u0435\u0442\u0430-\u0434\u0430\u043D\u043D\u044B\u0435';
    displayName: 'SEO';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'equipment-item.specifications': EquipmentItemSpecifications;
      'shared.seo': SharedSeo;
    }
  }
}
