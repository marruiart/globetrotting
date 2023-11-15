import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpProvider } from './http.provider';

export class HttpClientWebService extends HttpProvider {

  constructor(
    private httpClient: HttpClient
  ) {
    super();
  }

  /**
   * create http headers
   *
   * @param headers http headers
   * @param urlEncoded http request as url encoded content-type
   * @returns angular http headers
   */
  private createHeaders(
    headers: any,
    urlEncoded: boolean
  ): HttpHeaders {

    var _headers = new HttpHeaders(headers);
    if (urlEncoded) {
      _headers.set('Accept', ' application/x-www-form-urlencoded');
    }
    return _headers;
  }

  /**
   * create http request body
   *
   * @param body http request body
   * @param urlEncoded http request as url encoded content-type
   * @returns http request body
   */
  private createBody(body: any, urlEncoded: boolean): any | HttpParams {

    return urlEncoded ? new HttpParams({ fromObject: body }) : body;
  }

  /**
   * get the HTTP options to send with the request
   * 
   * @param headers http headers
   * @param params http params
   * @param urlEncoded http request as url encoded content-type
   * @returns object with http options
   */
  protected createOptions(
    headers: any,
    params: any,
    urlEncoded: boolean = false) {
    let _options = {
      headers: this.createHeaders(headers, urlEncoded),
      params: new HttpParams({ fromObject: params })
    }
    return _options;
  }

  // CRUD methods

  /**
   * get
   *
   * @param url http request url
   * @param params http request params
   * @param headers http request headers
   * @param urlEncoded http request as url encoded content-type
   * @returns observable with http response
   */
  public get<T>(
    url: string,
    params: any = {},
    headers: any = {},
    urlEncoded: boolean = false
  ): Observable<T> {

    return this.httpClient.get<T>(url,
      this.createOptions(headers, params, urlEncoded));
  }

  /**
   * post
   *
   * @param url http request url
   * @param body http request body
   * @param headers http request headers
   * @param urlEncoded http request as url encoded content-type
   * @returns observable with http response
   */
  public post<T>(
    url: string,
    body: any = {},
    headers: any = {},
    urlEncoded: boolean = false
  ): Observable<T> {

    const params = {};
    return this.httpClient.post<T>(url,
      this.createBody(body, urlEncoded),
      this.createOptions(headers, params, urlEncoded));
  }

  /**
   * put
   *
   * @param url http request url
   * @param body http request body
   * @param headers http request headers
   * @param urlEncoded http request as url encoded content-type
   * @returns observable with http response
   */
  public put<T>(
    url: string,
    body: any = {},
    headers: any = {},
    urlEncoded: boolean = false
  ): Observable<T> {

    const params = {};
    return this.httpClient.put<T>(url,
      this.createBody(body, urlEncoded),
      this.createOptions(headers, params, urlEncoded));
  }

  /**
   * patch
   *
   * @param url http request url
   * @param body http request body
   * @param headers http request headers
   * @param urlEncoded http request as url encoded content-type
   * @returns observable with http response
   */
  public patch<T>(
    url: string,
    body: any = {},
    headers: any = {},
    urlEncoded: boolean = false
  ): Observable<T> {

    const params = {};
    if (body instanceof FormData) {
      return this.httpClient.patch<T>(url, body, { headers: headers });
    }
    else {
      return this.httpClient.patch<T>(url,
        this.createBody(body, urlEncoded),
        this.createOptions(headers, params, urlEncoded));
    }
  }

  /**
   * delete
   *
   * @param url http request url
   * @param params http request params
   * @param headers http request headers
   * @param urlEncoded http request as url encoded content-type
   * @returns observable with http response
   */
  public delete<T>(
    url: string,
    headers: any = {},
    params: any = {},
    urlEncoded: boolean = false,
  ): Observable<T> {

    return this.httpClient.delete<T>(url,
      this.createOptions(headers, params, urlEncoded));
  }

}
