import { BackendTypes } from "src/environments/environment";
import { DataService } from "../services/api/data.service";
import { MappingService } from "../services/api/mapping.service";
import { StrapiFavoritesService } from "../services/api/strapi/strapi-favorites.service";
import { FirebaseFavoritesService } from "../services/api/firebase/firebase-favorites.service";

export function FavoritesServiceFactory(
  backend: BackendTypes,
  dataSvc: DataService,
  mappingSvc: MappingService
) {
  switch (backend) {
    case 'Strapi':
      return new StrapiFavoritesService(dataSvc, mappingSvc);
    case 'Firebase':
      return new FirebaseFavoritesService(dataSvc, mappingSvc);
    default:
      throw new Error('Backend not implemented');
  }
}