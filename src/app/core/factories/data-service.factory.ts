import { ApiService } from "../services/api/api.service";
import { BackendTypes } from "src/environments/environment";
import { FirebaseDataService } from "../services/api/firebase/firebase-data.service";
import { StrapiDataService } from "../services/api/strapi/strapi-data.service";
import { FirebaseService } from "../services/firebase/firebase.service";

export function DataServiceFactory(
  backend: BackendTypes,
  apiSvc: ApiService,
  firebaseSvc: FirebaseService
) {
  switch (backend) {
    case 'Strapi':
      return new StrapiDataService(apiSvc);
     case 'Firebase':
      return new FirebaseDataService(firebaseSvc); 
    default:
      throw new Error('Backend not implemented');
  }
}