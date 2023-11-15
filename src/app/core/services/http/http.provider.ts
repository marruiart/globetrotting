import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export abstract class HttpProvider {

  /**
   * get
   *
   * @param url http request url
   * @param params http request params
   * @param headers http request headers
   * @param urlEncoded http request as url encoded content-type
   * @returns observable with http response
   */
  public abstract get<T>(
    url: string,
    params: any,
    headers: any,
    urlEncoded?: boolean
  ): Observable<T>;

  /**
   * post
   *
   * @param url http request url
   * @param body http request body
   * @param headers http request headers
   * @param urlEncoded http request as url encoded content-type
   * @returns observable with http response
   */
  public abstract post<T>(
    url: string,
    body: any,
    headers: any,
    urlEncoded?: boolean
  ): Observable<T>;

  /**
   * put
   *
   * @param url http request url
   * @param body http request body
   * @param headers http request headers
   * @param urlEncoded http request as url encoded content-type
   * @returns observable with http response
   */
  public abstract put<T>(
    url: string,
    body: any,
    headers: any,
    urlEncoded?: boolean
  ): Observable<T>;

  /**
   * patch
   *
   * @param url http request url
   * @param body http request body
   * @param headers http request headers
   * @param urlEncoded http request as url encoded content-type
   * @returns observable with http response
   */
  public abstract patch<T>(
    url: string,
    body: any,
    headers: any,
    urlEncoded?: boolean
  ): Observable<T>;

  /**
   * delete
   *
   * @param url http request url
   * @param params http request params
   * @param headers http request headers
   * @param urlEncoded http request as url encoded content-type
   * @returns observable with http response
   */
  public abstract delete<T>(
    url: string,
    params: any,
    headers: any,
    urlEncoded?: boolean
  ): Observable<T>;

}
