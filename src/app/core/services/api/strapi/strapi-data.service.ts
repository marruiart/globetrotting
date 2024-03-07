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

  private getQueries(path: string): string {
    if (path.includes('extended-users') || path.includes('clients') || path.includes('agents')) {
      return "?populate=user.role";
    } else if (path.includes('favorites')) {
      return "?populate=destination,client";
    } else if (path.includes('me')) {
      return "?populate=role"
    }
    return "";
  }

  // CRUD methods

  public obtainAll<T>(
    path: string,
    queries: { [query: string]: string } = {},
    callback: ((res: T) => T) = res => res
  ): Observable<T> {

    const url = this.getUrl(path);
    return this.api.get<T>(url, queries)
      .pipe(map(callback), catchError(error => {
        console.log("ERROR obtainAll");
        console.error(error);
        throw new Error(error);
      }));
  }

  public obtain<T>(
    path: string,
    id: number,
    callback: ((res: T) => T),
    queries: { [query: string]: string } = {}
  ): Observable<T> {

    const url = this.getUrl(path, id);
    return this.api.get<T>(url, queries)
      .pipe(map(callback), catchError(error => {
        console.log("ERROR get");
        console.error(error);
        throw new Error(error);
      }));
  }

  public obtainMe<T>(
    path: string
  ): Observable<T> {

    const queries = this.getQueries(path);
    const url = `${this.getUrl(path)}${queries}`;
    return this.api.get<T>(url)
      .pipe(catchError(error => {
        console.log("ERROR getMe");
        console.error(error);
        throw new Error(error);
      }));
  }


  public save<T>(
    path: string,
    body: any,
    callback: ((res: T) => T) = (res => res)
  ): Observable<T> {

    const queries = this.getQueries(path);
    const url = `${this.getUrl(path)}${queries}`;
    return this.api.post<T>(url, body)
      .pipe(map(callback), catchError(error => {
        console.error("ERROR post", error);
        throw new Error(error);
      }));
  }

  public update<T>(
    path: string,
    id: number,
    body: any,
    callback: ((res: T) => T)
  ): Observable<T> {

    //FIXME Add queries to parameters
    const queries = this.getQueries(path);
    const url = `${this.getUrl(path, id)}${queries}`;
    return this.api.put<T>(url, body).pipe(
      map(callback),
      catchError(error => {
        console.error("ERROR update", error);
        throw new Error(error);
      }));
  }

  public delete<T>(
    path: string,
    callback: ((res: T) => T),
    id: number,
    queries: { [query: string]: string },
  ): Observable<T> {

    let user_query = this.getQueries(path);
    const url = `${this.getUrl(path, id)}${user_query}`;
    return this.api.delete<T>(url, queries)
      .pipe(map(callback), catchError(error => {
        console.log("ERROR delete");
        console.error(error);
        throw new Error(error);
      }));
  }

  public override updateArray<T>(path: string, id: string, field: string, value: any, callback: (res: any) => T = res => res): Observable<T> {
    throw new Error('Method not implemented.');
  }

  public override updateField<T>(path: string, id: string, field: string, value: any, callback: (res: any) => T = res => res): Observable<T> {
    throw new Error('Method not implemented.');
  }
}
