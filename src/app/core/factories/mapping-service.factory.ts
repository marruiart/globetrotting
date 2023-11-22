import { MappingStrapiService } from "../services/api/strapi/mapping-strapi.service";

export function MappingServiceFactory(
  backend: string
) {
  switch (backend) {
    case 'Strapi':
      return new MappingStrapiService();
    default:
      throw new Error('Backend not implemented');
  }
}