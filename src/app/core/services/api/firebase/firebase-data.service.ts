import { Observable, from, map } from 'rxjs';
import { DataService } from '../data.service';
import { Collections, FirebaseService } from '../../firebase/firebase.service';
import { DocumentSnapshot } from 'firebase/firestore';
import { FirebaseCollectionResponse, FirebaseDocument } from 'src/app/core/models/firebase-interfaces/firebase-data.interface';
import { FirebaseFacade } from 'src/app/core/+state/firebase/firebase.facade';
import { inject } from '@angular/core';

export class FirebaseDataService extends DataService {
    private firebaseFacade = inject(FirebaseFacade);

    constructor(
        private firebaseSvc: FirebaseService
    ) {
        super();
    }

    public override obtainAll<T>(path: string, queries: { [query: string]: string | DocumentSnapshot; }, callback: (res: FirebaseCollectionResponse) => T): Observable<T> {
        const collection = path.split('/')[2];
        const pagPage = queries['pagination[page]'];
        const page = pagPage && pagPage != "1" ? pagPage as DocumentSnapshot : null;
        return from(this.firebaseSvc.getDocuments(collection, page)).pipe(map(res => {
            return callback(res);
        }));
    }

    public override obtain<T>(path: string, id: string, callback: (res: any) => T, queries: { [query: string]: string; }): Observable<T> {
        throw new Error('Method not implemented.');
    }

    public override obtainMe<T>(path: string): Observable<T> {
        throw new Error('Method not implemented.');
    }

    public override save<T>(
        path: string,
        body: any,
        callback: (res: any) => T
    ): Observable<T> {
        const collection: Collections = path.split('/')[2] as Collections;
        const id = this.firebaseSvc.generateId();
        body = { ...body, id: id }
        return from(this.firebaseSvc.createDocumentWithId(collection, body, id)).pipe(
            map(docId => {
                this.firebaseFacade.updateSize(collection);
                return callback(docId);
            }))
    }

    public override update<T>(path: string, id: string, body: any, callback: (res: any) => T = res => res): Observable<T> {
        const collection = path.split('/')[2];
        return from(this.firebaseSvc.updateDocument(collection, `${id}`, body)).pipe(map(res => {
            const doc: FirebaseDocument = {
                id: body.id,
                data: body
            }
            return callback(doc);
        }));
    }

    public override updateObject<T>(path: string, id: string, field: string, value: any, callback: (res: any) => T = res => res): Observable<T> {
        const collection = path.split('/')[2];
        return from(this.firebaseSvc.updateDocumentObject(collection, `${id}`, field, value)).pipe(map(_ => {
            return callback(value);
        }));
    }

    public override delete<T>(path: string, callback: (res: any) => T, id: string, queries: { [query: string]: string; }): Observable<T> {
        const collection = path.split('/')[2];
        return from(this.firebaseSvc.deleteDocument(collection, `${id}`)).pipe(map(_ => {
            const del: FirebaseDocument = {
                id: id,
                data: {}
            }
            return callback(del);
        }));
    }

}