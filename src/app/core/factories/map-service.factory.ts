import { MapStrapiService } from "../services/api/strapi/map-strapi.service";

export function MapServiceFactory(
  backend: string
) {
  switch (backend) {
    case 'Strapi':
      return new MapStrapiService();
    default:
      throw new Error('Backend not implemented');
  }
}