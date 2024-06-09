import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

export class HttpClientWebService extends HttpService {

  constructor(
    private httpClient: HttpClient
  ) {
    super();
  }

  /**
   * Creates HTTP headers.
   *
   * @param headers HTTP headers.
   * @param urlEncoded Indicates if the request should be URL encoded.
   * @returns Angular HTTP headers.
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
   * Creates HTTP request body.
   *
   * @param body HTTP request body.
   * @param urlEncoded Indicates if the request should be URL encoded.
   * @returns HTTP request body.
   */
  private createBody(body: any, urlEncoded: boolean): any | HttpParams {

    return urlEncoded ? new HttpParams({ fromObject: body }) : body;
  }

  /**
   * Gets the HTTP options to send with the request.
   * 
   * @param headers HTTP headers.
   * @param params HTTP params.
   * @param urlEncoded Indicates if the request should be URL encoded.
   * @returns Object with HTTP options.
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
   * Sends a GET HTTP request.
   *
   * @param url HTTP request URL.
   * @param params HTTP request params.
   * @param headers HTTP request headers.
   * @param urlEncoded Indicates if the request should be URL encoded.
   * @returns Observable with HTTP response.
   */
  public get<T>(
    url: string,
    params: any = {},
    headers: any = {},
    urlEncoded: boolean = false
  ): Observable<T> {

    return this.httpClient.get<T>(url, this.createOptions(headers, params, urlEncoded));
  }

  /**
   * Sends a POST HTTP request.
   *
   * @param url HTTP request URL.
   * @param body HTTP request body.
   * @param headers HTTP request headers.
   * @param urlEncoded Indicates if the request should be URL encoded.
   * @returns Observable with HTTP response.
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
   * Sends a PUT HTTP request.
   *
   * @param url HTTP request URL.
   * @param body HTTP request body.
   * @param headers HTTP request headers.
   * @param urlEncoded Indicates if the request should be URL encoded.
   * @returns Observable with HTTP response.
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
   * Sends a PATCH HTTP request.
   *
   * @param url HTTP request URL.
   * @param body HTTP request body.
   * @param headers HTTP request headers.
   * @param urlEncoded Indicates if the request should be URL encoded.
   * @returns Observable with HTTP response.
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
   * Sends a DELETE HTTP request.
   *
   * @param url HTTP request URL.
   * @param params HTTP request params.
   * @param headers HTTP request headers.
   * @param urlEncoded Indicates if the request should be URL encoded.
   * @returns Observable with HTTP response.
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
