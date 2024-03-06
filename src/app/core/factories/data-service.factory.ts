import { ApiService } from "../services/api/api.service";
import { FirebaseDataService } from "../services/api/firebase/firebase-data.service";
import { StrapiDataService } from "../services/api/strapi/strapi-data.service";
import { Backend, Backends } from "../utilities/utilities";

export function DataServiceFactory(
  backend: Backend,
  apiSvc: ApiService,
) {
  switch (backend) {
    case Backends.STRAPI:
      return new StrapiDataService(apiSvc);
     case Backends.FIREBASE:
      return new FirebaseDataService(); 
    default:
      throw new Error('Backend not implemented');
  }
}