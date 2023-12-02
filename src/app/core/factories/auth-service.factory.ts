import { AuthStrapiService } from "../services/api/strapi/auth-strapi.service";

export function AuthServiceFactory(
  backend: string
) {
  switch (backend) {
    case 'Strapi':
      return new AuthStrapiService();
    default:
      throw new Error('Backend not implemented');
  }
}