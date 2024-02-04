import { Observable, from, map, mergeMap, tap } from 'rxjs';
import { DataService } from '../data.service';
import { Collections, FirebaseService } from '../../firebase/firebase.service';
import { DocumentSnapshot } from 'firebase/firestore';
import { FirebaseCollectionResponse } from 'src/app/core/models/firebase-interfaces/firebase-data.interface';
import { FirebaseFacade } from 'src/app/core/+state/firebase/firebase.facade';
import { inject } from '@angular/core';

export class FirebaseDataService extends DataService {
    private firebaseFacade = inject(FirebaseFacade);

    constructor(
        private firebaseSvc: FirebaseService
    ) {
        super();
        this.firebaseFacade.init();
    }

    public override obtainAll<T>(path: string, queries: { [query: string]: string | DocumentSnapshot; }, callback: (res: FirebaseCollectionResponse) => T): Observable<T> {
        const collection = path.split('/')[2];
        const pagPage = queries['pagination[page]'];
        const page = pagPage && pagPage != "1" ? pagPage as DocumentSnapshot : null;
        return from(this.firebaseSvc.getDocuments(collection, page)).pipe(map(res => {
            return callback(res);
        }));
    }

    public override obtain<T>(path: string, id: number, callback: <S>(res: S) => T, queries: { [query: string]: string; }): Observable<T> {
        throw new Error('Method not implemented.');
    }

    public override obtainMe<T>(path: string): Observable<T> {
        throw new Error('Method not implemented.');
    }

    public override save<T>(
        path: string,
        body: any,
        callback: <S>(res: S) => T
    ): Observable<T> {
        const collection: Collections = path.split('/')[2] as Collections;
        return from(this.firebaseSvc.createDocument(collection, body)).pipe(
            map(docId => {
                this.firebaseFacade.updateSize(collection);
                return callback(docId);
            }))
    }

    public override update<T>(path: string, id: number | string, body: any, callback: <S>(res: S) => T): Observable<T> {
        const collection = path.split('/')[2];
        return from(this.firebaseSvc.updateDocument(collection, `${id}`, body)).pipe(map(res => {
            return callback(res);
        }));
    }

    public override delete<T>(path: string, callback: <S>(res: S) => T, id: number, queries: { [query: string]: string; }): Observable<T> {
        throw new Error('Method not implemented.');
    }

}