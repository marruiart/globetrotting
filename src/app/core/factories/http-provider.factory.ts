import { HttpClient } from "@angular/common/http";
import { HttpClientWebService } from "../services/http/http-client-web.service";

export function httpProviderFactory(
    httpClient: HttpClient
) {
    return new HttpClientWebService(httpClient);
}