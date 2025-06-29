import type { Schema, Struct } from '@strapi/strapi';

export interface EquipmentSpecifications extends Struct.ComponentSchema {
  collectionName: 'components_equipment_specifications';
  info: {
    displayName: 'Технические характеристики';
    description: 'Технические характеристики техники';
  };
  attributes: {
    power: Schema.Attribute.String;
    weight: Schema.Attribute.String;
    workingWidth: Schema.Attribute.String;
    capacity: Schema.Attribute.String;
    fuelConsumption: Schema.Attribute.String;
    maxDepth: Schema.Attribute.String;
    dimensions: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'SEO';
    description: 'SEO мета-данные';
  };
  attributes: {
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    keywords: Schema.Attribute.Text;
    metaImage: Schema.Attribute.Media<'images'>;
    canonicalURL: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'equipment.specifications': EquipmentSpecifications;
      'shared.seo': SharedSeo;
    }
  }
}