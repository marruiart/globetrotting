import { Backend } from "src/app/app.module";
import { AuthStrapiService } from "../services/api/strapi/auth-strapi.service";
//import { AuthFirebaseService } from "../services/api/firebase/auth-firebase.service";

export function AuthServiceFactory(
  backend: string
) {
  switch (backend) {
    case Backend.STRAPI:
      return new AuthStrapiService();
    /* case Backend.FIREBASE:
      return new AuthFirebaseService(); */
    default:
      throw new Error('Backend not implemented');
  }
}