import { StrapiAuthService } from "../services/api/strapi/strapi-auth.service";
import { FirebaseAuthService } from "../services/api/firebase/firebase-auth.service";
import { BackendTypes } from "src/environments/environment";

export function AuthServiceFactory(
  backend: BackendTypes
) {
  switch (backend) {
    case 'Strapi':
      return new StrapiAuthService();
    case 'Firebase':
      return new FirebaseAuthService();
    default:
      throw new Error('Backend not implemented');
  }
}