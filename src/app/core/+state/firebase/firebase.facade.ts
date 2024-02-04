import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import * as FirebaseActions from './firebase.actions'
import * as FirebaseSelector from './firebase.selectors'

@Injectable()
export class FirebaseFacade {

    private readonly store = inject(Store);
    sizes$ = this.store.pipe(select(FirebaseSelector.selectSizes));

    init() {
        this.store.dispatch(FirebaseActions.init());
    }

    updateSize(collection: string) {
        this.store.dispatch(FirebaseActions.updateSizes({ collection }));
    }
}