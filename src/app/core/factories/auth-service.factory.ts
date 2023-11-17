import { ApiService } from "../services/api/api.service";
import { AuthStrapiService } from "../services/api/strapi/auth-strapi.service";
import { JwtService } from "../services/auth/jwt.service";

export function AuthServiceFactory(
    apiSvc: ApiService,
    jwtSvc: JwtService,
  ) {
    return new AuthStrapiService(apiSvc, jwtSvc);
  }