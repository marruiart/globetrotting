import { ApiService } from "../services/api/api.service";
import { BackendTypes } from "src/environments/environment";
import { FirebaseDataService } from "../services/api/firebase/firebase-data.service";
import { StrapiDataService } from "../services/api/strapi/strapi-data.service";

export function DataServiceFactory(
  backend: BackendTypes,
  api: ApiService
) {
  switch (backend) {
    case 'Strapi':
      return new StrapiDataService(api);
     case 'Firebase':
      return new FirebaseDataService(); 
    default:
      throw new Error('Backend not implemented');
  }
}