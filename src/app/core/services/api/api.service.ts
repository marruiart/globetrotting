import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JwtService } from '../auth/jwt.service';
import { HttpService } from '../http/http.service';
import { environment } from 'src/environments/environment';

@Injectable(
  { providedIn: 'root' }
)
export abstract class ApiService {
  private http = inject(HttpService);
  protected jwtSvc = inject(JwtService);

  private getHeader(url: string, accept = null, contentType = null) {
    var header: any = {};
    if (accept) {
      header['Accept'] = accept;
    }
    if (contentType) {
      header['Content-Type'] = contentType;
    }
    if (!url.includes('auth')) {
      let token = this.jwtSvc.getToken();
      if (token != '') {
        header['Authorization'] = `Bearer ${token}`;
      }
    }
    return header;
  }

  // CRUD methods

  public get<T>(
    url: string,
    queries: { [query: string]: string } = {},
  ): Observable<T> {

    return this.http.get<T>(url, queries, this.getHeader(url));
  }

  public post<T>(
    url: string,
    body: any
  ): Observable<T> {

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