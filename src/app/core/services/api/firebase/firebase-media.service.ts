import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { MediaService } from '../media.service';
import { FIREBASE_API_URL, FirebaseEndpoints } from 'src/app/core/utilities/utilities';

export class FirebaseMediaService extends MediaService {

  constructor(
    private apiSvc: ApiService
  ) {
    super();
  }

  public override upload(blob: Blob): Observable<any[]> {
    throw new Error('Method not implemented.');
  }

  public override generateCsv(body: any, token: string): Observable<{ "files_location": string[] }> {
    return this.apiSvc.post(`${FIREBASE_API_URL}${FirebaseEndpoints.DOWNLOAD_CSV}`, body, token)
  }

  public override downloadFile(url: string): Observable<any> {
    return this.apiSvc.get(url);
  }


}
