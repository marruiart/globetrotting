import { Backend } from "src/app/app.module";
import { StrapiDataService } from "../services/api/strapi/strapi-data.service";
import { ApiService } from "../services/api/api.service";
//import { AuthFirebaseService } from "../services/api/firebase/auth-firebase.service";

export function DataServiceFactory(
  backend: string,
  api: ApiService
) {
  switch (backend) {
    case Backend.STRAPI:
      return new StrapiDataService(api);
    /* case Backend.FIREBASE:
      return new FirebaseDataService(api); */
    default:
      throw new Error('Backend not implemented');
  }
}