import { Backend, Backends } from "../utilities/utilities";
import { ApiService } from "../services/api/api.service";
import { FirebaseMediaService } from "../services/api/firebase/firebase-media.service";

export function MediaServiceFactory(
    backend: Backend,
    apiSvc: ApiService
) {
    switch (backend) {
        case Backends.STRAPI:
            return new Error('Strapi backend not implemented');
        case Backends.FIREBASE:
            return new FirebaseMediaService(apiSvc);
        default:
            throw new Error('Backend not implemented');
    }
}