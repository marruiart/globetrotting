import { StrapiMappingService } from "../services/api/strapi/strapi-mapping.service";
import { FirebaseMappingService } from "../services/api/firebase/firebase-mapping.service";
import { BackendTypes } from "src/environments/environment";

export function MappingServiceFactory(
  backend: BackendTypes
) {
  switch (backend) {
    case 'Strapi':
      return new StrapiMappingService();
     case 'Firebase':
      return new FirebaseMappingService(); 
    default:
      throw new Error('Backend not implemented');
  }
}