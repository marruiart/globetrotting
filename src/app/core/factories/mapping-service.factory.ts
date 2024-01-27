import { Backend } from "src/app/app.module";
//import { FirebaseMappingService } from "../services/api/firebase/firebase-mapping.service";
import { StrapiMappingService } from "../services/api/strapi/strapi-mapping.service";

export function MappingServiceFactory(
  backend: string
) {
  switch (backend) {
    case Backend.STRAPI:
      return new StrapiMappingService();
    /* case Backend.FIREBASE:
      return new FirebaseMappingService(); */
    default:
      throw new Error('Backend not implemented');
  }
}