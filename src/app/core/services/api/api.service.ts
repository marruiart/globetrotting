import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { JwtService } from '../auth/jwt.service';
import { HttpService } from '../http/http.service';

@Injectable(
  { providedIn: 'root' }
)
export abstract class ApiService {
  private http = inject(HttpService)
  protected jwtSvc = inject(JwtService)

  constructor() { }

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

  private getUrl(path: string, id: number | null = null) {
    return `${environment.STRAPI_URL}${path}${id ? `/${id}` : ''}`;
  }

  private getUserQuery(path: string): string {
    if (path.includes('extended-users') || path.includes('clients') || path.includes('agents')) {
      return "?populate=user";
    }
    return "";
  }

  // CRUD methods

  protected getAll<T>(
    path: string,
    queries: { [query: string]: string } = {},
    callback: ((res: T) => T)
  ): Observable<T> {

    const url = this.getUrl(path);
    return this.http.get<T>(url, queries, this.getHeader(url))
      .pipe(map(callback), catchError(error => {
        console.log("ERROR getAll");
        console.error(error);
        return throwError(() => error);
      }));
  }

  protected get<T>(
    path: string,
    id: number,
    callback: ((res: T) => T),
    queries: { [query: string]: string } = {},
  ): Observable<T> {

    const url = this.getUrl(path, id);
    return this.http.get<T>(url, queries, this.getHeader(url))
      .pipe(map(callback), catchError(error => {
        console.log("ERROR get");
        console.error(error);
        return throwError(() => error);
      }));
  }

  protected getMe<T>(
    path: string,
    queries: { [query: string]: string } = {},
  ): Observable<T> {

    const url = this.getUrl(path);
    return this.http.get<T>(url, queries, this.getHeader(url))
      .pipe(catchError(error => {
        console.log("ERROR getMe");
        console.error(error);
        return throwError(() => error);
      }));
  }


  protected post<T>(
    path: string,
    body: any,
    callback: ((res: T) => T) = (res => res)
  ): Observable<T | null> {

    let user_query = this.getUserQuery(path);
    const url = `${this.getUrl(path)}${user_query}`;
    return this.http.post<T>(url, body, this.getHeader(url))
      .pipe(map(callback), catchError(error => {
        console.log("ERROR post");
        console.error(error);
        return throwError(() => error);
      }));
  }

  protected add<T>(
    path: string,
    body: any,
    callback: ((res: T) => T)
  ): Observable<T> {
    let user_query = this.getUserQuery(path);
    const url = `${this.getUrl(path)}${user_query}`;
    return this.http.post<T>(url, body, this.getHeader(url))
      .pipe(map(callback), catchError(error => {
        console.log("ERROR add");
        console.error(error);
        return throwError(() => error);
      }));
  }

  protected update<T>(
    path: string,
    id: number,
    body: any,
    callback: ((res: T) => T)
  ): Observable<T> {

    let user_query = this.getUserQuery(path);
    const url = `${this.getUrl(path, id)}${user_query}`;
    return this.http.put<T>(url, body, this.getHeader(url))
      .pipe(map(callback), catchError(error => {
        console.log("ERROR update");
        console.error(error);
        return throwError(() => error);
      }));
  }

  protected delete<T>(
    path: string,
    callback: ((res: T) => T),
    id: number,
    queries: { [query: string]: string } = {},
  ): Observable<T> {

    let user_query = this.getUserQuery(path);
    const url = `${this.getUrl(path, id)}${user_query}`;
    return this.http.delete<T>(url, this.getHeader(url), queries)
      .pipe(map(callback), catchError(error => {
        console.log("ERROR delete");
        console.error(error);
        return throwError(() => error);
      }));
  }

}