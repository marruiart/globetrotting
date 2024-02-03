import { Observable, from, map } from 'rxjs';
import { DataService } from '../data.service';
import { FirebaseService } from '../../firebase/firebase.service';
import { DocumentSnapshot } from 'firebase/firestore';

export class FirebaseDataService extends DataService {

    constructor(
        private firebaseSvc: FirebaseService
    ) {
        super();
    }

    public override obtainAll<T>(path: string, queries: { [query: string]: string | DocumentSnapshot; }, callback: <S>(res: S) => T): Observable<T> {
        const collection = path.split('/')[2];
        const pagPage = queries['pagination[page]'];
        const page = pagPage && pagPage != "1" ? pagPage as DocumentSnapshot: null;
        return from(this.firebaseSvc.getDocuments(collection, page)).pipe(map(res => {
            return callback(res.docs);
        }));
    }

    public override obtain<T>(path: string, id: number, callback: (res: T) => T, queries: { [query: string]: string; }): Observable<T> {
        throw new Error('Method not implemented.');
    }

    public override obtainMe<T>(path: string): Observable<T> {
        throw new Error('Method not implemented.');
    }

    public override send<T>(path: string, body: any, callback: (res: T) => T): Observable<T> {
        throw new Error('Method not implemented.');
    }

    public override update<T>(path: string, id: number, body: any, callback: (res: T) => T): Observable<T> {
        throw new Error('Method not implemented.');
    }

    public override delete<T>(path: string, callback: (res: T) => T, id: number, queries: { [query: string]: string; }): Observable<T> {
        throw new Error('Method not implemented.');
    }

}