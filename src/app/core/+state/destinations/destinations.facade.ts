import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import * as DestinationsActions from './destinations.actions'
import * as DestinationsSelector from './destinations.selectors'
import { Destination, NewDestination, PaginatedDestination, TableRow } from "../../models/globetrotting/destination.interface";

@Injectable()
export class DestinationsFacade {

    private readonly store = inject(Store);
    destinations$ = this.store.pipe(select(DestinationsSelector.selectDestinations));
    destinationsPage$ = this.store.pipe(select(DestinationsSelector.selectPage));
    destinationTable$ = this.store.pipe(select(DestinationsSelector.selectManagementTable));
    error$ = this.store.pipe(select(DestinationsSelector.selectError));

    saveDestinations(destinations: Destination[]) {
        if (destinations) {
            this.store.dispatch(DestinationsActions.saveDestinations({ destinations }));
        }
    }

    savePaginatedDestinations(destinationsPage: PaginatedDestination) {
        if (destinationsPage) {
            this.store.dispatch(DestinationsActions.savePage({ destinationsPage }));
        }
    }

    saveDestinationsManagementTable(managementTable: TableRow[]) {
        if (managementTable) {
            this.store.dispatch(DestinationsActions.saveManagementTable({ managementTable }));
        }
    }

    addDestination(newDestination: NewDestination) {
        this.store.dispatch(DestinationsActions.addDestination({ newDestination }));
    }

    updateDestination(destination: Destination) {
        this.store.dispatch(DestinationsActions.updateDestination({ destination }));
    }

    deleteDestination(id: string | number) {
        this.store.dispatch(DestinationsActions.deleteDestination({ id }));
    }
}