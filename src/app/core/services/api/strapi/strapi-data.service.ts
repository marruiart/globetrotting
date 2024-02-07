import { environment } from 'src/environments/environment';
import { DataService } from '../data.service';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiService } from '../api.service';

export class StrapiDataService extends DataService {

  constructor(
    private api: ApiService
  ) {
    super();
  }

  private getUrl(path: string, id: number | null = null) {
    return `${environment.strapiUrl}${path}${id ? `/${id}` : ''}`;
  }

  private getUserQuery(path: string): string {
    if (path.includes('extended-users') || path.includes('clients') || path.includes('agents')) {
      return "?populate=user";
    }
    return "";
  }

  // CRUD methods

  public obtainAll<T>(
    path: string,
    queries: { [query: string]: string } = {},
    callback: ((res: T) => T)
  ): Observable<T> {

    const url = this.getUrl(path);
    return this.api.get<T>(url, queries)
      .pipe(map(callback), catchError(error => {
        console.log("ERROR obtainAll");
        console.error(error);
        return throwError(() => error);
      }));
  }

  public obtain<T>(
    path: string,
    id: number,
    callback: ((res: T) => T),
    queries: { [query: string]: string } = {},
  ): Observable<T> {

    const url = this.getUrl(path, id);
    return this.api.get<T>(url, queries)
      .pipe(map(callback), catchError(error => {
        console.log("ERROR get");
        console.error(error);
        return throwError(() => error);
      }));
  }

  public obtainMe<T>(
    path: string
  ): Observable<T> {

    const queries: { [query: string]: string } = { 'populate': 'role' };
    const url = this.getUrl(path);
    return this.api.get<T>(url, queries)
      .pipe(catchError(error => {
        console.log("ERROR getMe");
        console.error(error);
        return throwError(() => error);
      }));
  }


  public save<T>(
    path: string,
    body: any,
    callback: ((res: T) => T) = (res => res)
  ): Observable<T> {

    let user_query = this.getUserQuery(path);
    const url = `${this.getUrl(path)}${user_query}`;
    return this.api.post<T>(url, body)
      .pipe(map(callback), catchError(error => {
        console.log("ERROR post");
        console.error(error);
        return throwError(() => error);
      }));
  }

  public update<T>(
    path: string,
    id: number,
    body: any,
    callback: ((res: T) => T)
  ): Observable<T> {

    let user_query = this.getUserQuery(path);
    const url = `${this.getUrl(path, id)}${user_query}`;
    return this.api.put<T>(url, body)
      .pipe(map(callback), catchError(error => {
        console.log("ERROR update");
        console.error(error);
        return throwError(() => error);
      }));
  }

  public delete<T>(
    path: string,
    callback: ((res: T) => T),
    id: number,
    queries: { [query: string]: string },
  ): Observable<T> {

    let user_query = this.getUserQuery(path);
    const url = `${this.getUrl(path, id)}${user_query}`;
    return this.api.delete<T>(url, queries)
      .pipe(map(callback), catchError(error => {
        console.log("ERROR delete");
        console.error(error);
        return throwError(() => error);
      }));
  }

  public override updateObject<T>(path: string, id: string | number, key: string, value: any, callback: (res: any) => T): Observable<T> {
    throw new Error('Method not implemented.');
  }
}
