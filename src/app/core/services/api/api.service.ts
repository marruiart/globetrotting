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

  public get<T>(
    url: string,
    queries: { [query: string]: string } = {}
  ): Observable<T> {
    if (url.includes("https://firebasestorage.googleapis.com")) {
      return this.http.get<T>(url, queries, this.getHeader(url))
    }
    return this.http.get<T>(url, queries, this.getHeader(url));
  }

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

  public put<T>(
    url: string,
    body: any,
  ): Observable<T> {

    return this.http.put<T>(url, body, this.getHeader(url));
  }

  public delete<T>(
    url: string,
    queries: { [query: string]: string }
  ): Observable<T> {

    return this.http.delete<T>(url, this.getHeader(url), queries);
  }

}