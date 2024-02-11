import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import * as FirebaseActions from './firebase.actions'
import * as FirebaseSelector from './firebase.selectors'
import { FirebaseDocument } from "../../models/firebase-interfaces/firebase-data.interface";

@Injectable()
export class FirebaseFacade {

    private readonly store = inject(Store);
    sizes$ = this.store.pipe(select(FirebaseSelector.selectSizes));
    error$ = this.store.pipe(select(FirebaseSelector.selectError));

    initSizes(docs: FirebaseDocument[]) {
        this.store.dispatch(FirebaseActions.initSizes({ docs }));
    }

    updateSize(collection: string) {
        this.store.dispatch(FirebaseActions.updateSizes({ collection }));
    }
}