import { Observable, catchError, from, lastValueFrom, map, mergeMap, of, switchMap, tap, throwError } from 'rxjs';
import { DataService } from '../data.service';
import { Collections, FirebaseService } from '../../firebase/firebase.service';
import { DocumentSnapshot } from 'firebase/firestore';
import { FirebaseCollectionResponse } from 'src/app/core/models/firebase-interfaces/firebase-data.interface';
import { FirebaseFacade } from 'src/app/core/+state/firebase/firebase.facade';
import { inject } from '@angular/core';
import { UsersService } from '../users.service';
import { AuthFacade } from 'src/app/core/+state/auth/auth.facade';

export class FirebaseDataService extends DataService {
    private firebaseFacade = inject(FirebaseFacade);
    private authFacade = inject(AuthFacade);

    constructor(
        private firebaseSvc: FirebaseService
    ) {
        super();
        this.firebaseFacade.init();
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    public override obtainAll<T>(path: string, queries: { [query: string]: string | DocumentSnapshot; }, callback: (res: FirebaseCollectionResponse) => T): Observable<T> {
        const collection = path.split('/')[2];
        const pagPage = queries['pagination[page]'];
        const page = pagPage && pagPage != "1" ? pagPage as DocumentSnapshot : null;
        return from(this.firebaseSvc.getDocuments(collection, page)).pipe(map(res => {
            return callback(res);
        }));
    }

    public override obtain<T>(path: string, id: number, callback: (res: any) => T, queries: { [query: string]: string; }): Observable<T> {
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
        const id = this.generateId();
        body = { ...body, id: id }
        return from(this.firebaseSvc.createDocumentWithId(collection, body, id)).pipe(
            map(docId => {
                this.firebaseFacade.updateSize(collection);
                return callback(docId);
            }))
    }

    public override update<T>(path: string, id: number | string, body: any, callback: (res: any) => T = res => res): Observable<T> {
        const collection = path.split('/')[2];
        return from(this.firebaseSvc.updateDocument(collection, `${id}`, body)).pipe(map(res => {
            return callback(res);
        }));
    }

    public override updateObject<T>(path: string, id: number | string, field: string, value: any, callback: (res: any) => T = res => res): Observable<T> {
        const collection = path.split('/')[2];
        return from(this.firebaseSvc.updateDocumentObject(collection, `${id}`, field, value)).pipe(map(res => {
            return callback(res);
        }));
    }

    public override delete<T>(path: string, callback: (res: any) => T, id: number, queries: { [query: string]: string; }): Observable<T> {
        throw new Error('Method not implemented.');
    }

}