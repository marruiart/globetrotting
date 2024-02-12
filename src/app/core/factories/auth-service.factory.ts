import { StrapiAuthService } from "../services/api/strapi/strapi-auth.service";
import { FirebaseAuthService } from "../services/api/firebase/firebase-auth.service";
import { BackendTypes } from "src/environments/environment";
import { JwtService } from "../services/auth/jwt.service";
import { ApiService } from "../services/api/api.service";

export function AuthServiceFactory(
  backend: BackendTypes,
  jwtSvc: JwtService,
  apiSvc: ApiService
) {
  switch (backend) {
    case 'Strapi':
      return new StrapiAuthService(jwtSvc, apiSvc);
    case 'Firebase':
      return new FirebaseAuthService();
    default:
      throw new Error('Backend not implemented');
  }
}