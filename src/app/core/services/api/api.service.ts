import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JwtService } from '../auth/jwt.service';
import { HttpService } from '../http/http.service';
import { FIREBASE_API_URL } from '../../utilities/utilities';

@Injectable(
  { providedIn: 'root' }
)
export abstract class ApiService {
  private http = inject(HttpService);
  protected jwtSvc = inject(JwtService);

  private getHeader(url: string, accept: string | null = null, contentType: string | null = null, token: string = '') {
    var header: any = {};
    if (accept) {
      header['Accept'] = accept;
    }
    if (contentType) {
      header['Content-Type'] = contentType;
    }
    if (!url.includes('auth')) {
      if (token == '') {
        token = this.jwtSvc.getToken();
      }
      if (token != '') {
        header['Authorization'] = `Bearer ${token}`;
      }
    }
    console.log(header)
    return header;
  }

  // CRUD methods

  /**
 * Makes an HTTP GET request to the specified URL.
 * If the URL includes "https://firebasestorage.googleapis.com", it adds specific headers.
 *
 * @param {string} url - The URL to make the GET request to.
 * @param {{ [query: string]: string }} [queries={}] - The query parameters to include in the request.
 * @returns {Observable<T>} An observable of the response.
 */
  public get<T>(
    url: string,
    queries: { [query: string]: string } = {}
  ): Observable<T> {
    if (url.includes("https://firebasestorage.googleapis.com")) {
      return this.http.get<T>(url, queries, this.getHeader(url))
    }
    return this.http.get<T>(url, queries, this.getHeader(url));
  }

  /**
 * Makes an HTTP POST request to the specified URL.
 * If the URL includes the Firebase API URL, it adds specific headers.
 *
 * @param {string} url - The URL to make the POST request to.
 * @param {any} body - The body of the POST request.
 * @param {string} [token=''] - The token to include in the request headers.
 * @returns {Observable<T>} An observable of the response.
 */
  public post<T>(
    url: string,
    body: any,
    token: string = ''
  ): Observable<T> {
    if (url.includes(FIREBASE_API_URL)) {
      return this.http.post<T>(url, body, this.getHeader(url, '*/*', 'application/json', token))
    }
    return this.http.post<T>(url, body, this.getHeader(url));
  }

  /**
 * Makes an HTTP PUT request to the specified URL.
 *
 * @param {string} url - The URL to make the PUT request to.
 * @param {any} body - The body of the PUT request.
 * @returns {Observable<T>} An observable of the response.
 */
  public put<T>(
    url: string,
    body: any,
  ): Observable<T> {

    return this.http.put<T>(url, body, this.getHeader(url));
  }

  /**
 * Makes an HTTP DELETE request to the specified URL.
 *
 * @param {string} url - The URL to make the DELETE request to.
 * @param {{ [query: string]: string }} queries - The query parameters to include in the request.
 * @returns {Observable<T>} An observable of the response.
 */
  public delete<T>(
    url: string,
    queries: { [query: string]: string }
  ): Observable<T> {

    return this.http.delete<T>(url, this.getHeader(url), queries);
  }

}