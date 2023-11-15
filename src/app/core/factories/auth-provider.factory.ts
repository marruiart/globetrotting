import { ApiService } from "../services/api.service";
import { AuthStrapiService } from "../services/auth/auth-strapi.service";
import { JwtService } from "../services/auth/jwt.service";

export function AuthProviderFactory(
    apiSvc: ApiService,
    jwtSvc: JwtService,
  ) {
    return new AuthStrapiService(apiSvc, jwtSvc);
  }