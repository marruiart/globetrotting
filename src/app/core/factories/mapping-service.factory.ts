import { StrapiMappingService } from "../services/api/strapi/strapi-mapping.service";
import { FirebaseMappingService } from "../services/api/firebase/firebase-mapping.service";
import { BackendTypes } from "src/environments/environment";
import { Backends } from "../utilities/utilities";

export function MappingServiceFactory(
  backend: BackendTypes
) {
  switch (backend) {
    case Backends.STRAPI:
      return new StrapiMappingService();
    case Backends.FIREBASE:
      return new FirebaseMappingService();
    default:
      throw new Error('Backend not implemented');
  }
}