import { StrapiAuthService } from "../services/api/strapi/strapi-auth.service";
import { FirebaseAuthService } from "../services/api/firebase/firebase-auth.service";
import { JwtService } from "../services/auth/jwt.service";
import { ApiService } from "../services/api/api.service";
import { BackendTypes, Backends } from "../utilities/utilities";

export function AuthServiceFactory(
  backend: BackendTypes,
  jwtSvc: JwtService,
  apiSvc: ApiService
) {
  switch (backend) {
    case Backends.STRAPI:
      return new StrapiAuthService(jwtSvc, apiSvc);
    case Backends.FIREBASE:
      return new FirebaseAuthService();
    default:
      throw new Error('Backend not implemented');
  }
}