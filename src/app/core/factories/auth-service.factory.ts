import { ApiService } from "../services/api/api.service";
import { AuthStrapiService } from "../services/api/strapi/auth-strapi.service";
import { JwtService } from "../services/auth/jwt.service";

export function AuthServiceFactory(
  backend: string,
  apiSvc: ApiService,
  jwtSvc: JwtService,
) {
  switch (backend) {
    case 'Strapi':
      return new AuthStrapiService(apiSvc, jwtSvc);
    default:
      throw new Error('Backend not implemented');
  }
}