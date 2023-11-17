import { MapStrapiService } from "../services/api/strapi/map-strapi.service";

export function MapServiceFactory() {
    return new MapStrapiService();
  }