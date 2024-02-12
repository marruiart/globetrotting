import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import * as DestinationsActions from './destinations.actions'
import * as DestinationsSelector from './destinations.selectors'
import { Destination, NewDestination, PaginatedDestination } from "../../models/globetrotting/destination.interface";

@Injectable()
export class DestinationsFacade {

    private readonly store = inject(Store);
    destinations$ = this.store.pipe(select(DestinationsSelector.selectDestinations));
    destinationsPage$ = this.store.pipe(select(DestinationsSelector.selectPage));
    error$ = this.store.pipe(select(DestinationsSelector.selectError));

    updateDestinations(destinations: Destination[]) {
        this.store.dispatch(DestinationsActions.init({ destinations }));
    }

    savePaginatedDestinations(destinationsPage: PaginatedDestination) {
        this.store.dispatch(DestinationsActions.savePage({ destinationsPage }));
    }

    addDestination(newDestination: NewDestination) {
        this.store.dispatch(DestinationsActions.addDestination({ newDestination }));
    }

    deleteDestination(id: string | number) {
        this.store.dispatch(DestinationsActions.deleteDestination({ id }));
    }
}