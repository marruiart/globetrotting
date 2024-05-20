import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export abstract class MediaService {

  public abstract upload(blob: Blob): Observable<any[]>;
  public abstract generateCsv(body: any, token: string): Observable<any>;
  public abstract downloadFile(url: string): Observable<any>;
}
