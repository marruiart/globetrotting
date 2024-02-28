import { Component, OnDestroy } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { Observable, catchError, of, switchMap, tap, zip } from "rxjs";
import { AuthFacade } from "src/app/core/+state/auth/auth.facade";
import { DestinationsFacade } from "src/app/core/+state/destinations/destinations.facade";
import { Destination, PaginatedDestination, DestinationsTableRow } from "src/app/core/models/globetrotting/destination.interface";
import { AdminAgentOrClientUser } from "src/app/core/models/globetrotting/user.interface";
import { CustomTranslateService } from "src/app/core/services/custom-translate.service";
import { SubscriptionsService } from "src/app/core/services/subscriptions.service";
import { Roles } from "src/app/core/utilities/utilities";


@Component({
  selector: 'app-destinations-management',
  templateUrl: './destinations-management.page.html',
  styleUrls: ['./destinations-management.page.scss'],
})
export class DestinationsManagementPage implements OnDestroy {
  private _component = 'DestinationsManagementPage';
  public loading: boolean = false;
  public data: DestinationsTableRow[] = [];
  public cols: any[] = [];
  public currentUser: AdminAgentOrClientUser | null = null;
  public showEditForm: boolean = false;
  public selectedDestination: Destination | null = null;

  constructor(
    public destinationsFacade: DestinationsFacade,
    private authFacade: AuthFacade,
    private subsSvc: SubscriptionsService,
    private translate: CustomTranslateService,
    // PrimeNG
    private confirmationSvc: ConfirmationService,
    private messageSvc: MessageService
  ) {
    this.destinationsFacade.initDestinations();
    this.subsSvc.addSubscriptions([
      {
        component: this._component,
        sub: this.authFacade.currentUser$.subscribe(currentUser => this.currentUser = currentUser)
      },
      {
        component: this._component,
        sub: this.translate.language$.pipe(
          switchMap((_: string) => this.getCols()),
          catchError(err => of(err))).subscribe()
      },
      {
        component: this._component,
        sub: this.displayTable().subscribe((table: DestinationsTableRow[]) => {
          this.destinationsFacade.saveDestinationsManagementTable(table);
        })
      }
    ])
  }

  /**
* Obtains from the agent service an array of destinations and maps each of them into a TableRow.
* @returns an observable of an array of TableRow.
*/
  private displayTable(): Observable<DestinationsTableRow[]> {
    if (this.currentUser?.role == Roles.AGENT || this.currentUser?.role == Roles.ADMIN) {
      return this.destinationsFacade.destinationsPage$.pipe(
        switchMap((page: PaginatedDestination): Observable<DestinationsTableRow[]> => this.mapDestinationsRows(page.data)),
        catchError(err => of(err))
      )
    } else {
      return of([]);
    }
  }


  private getCols() {
    const name$ = this.translate.getTranslation("destManagement.tableName");
    const type$ = this.translate.getTranslation("destManagement.tableType");
    const dimension$ = this.translate.getTranslation("destManagement.tableDimension");
    const price$ = this.translate.getTranslation("destManagement.tablePrice");
    const description$ = this.translate.getTranslation("destManagement.tableDescription");
    const options$ = this.translate.getTranslation("destManagement.tableOptions");

    const tableHeaders$ = zip(name$, type$, dimension$, price$, description$, options$).pipe(
      tap(([name, type, dimension, price, description, options]) => {
        this.cols = this.translateMenuItems(name, type, dimension, price, description, options);
      }), catchError(err => of(err)));

    return tableHeaders$;
  }

  private translateMenuItems(name: string, type: string, dimension: string, price: string, description: string, options: string) {
    return [
      { field: 'name', header: name },
      { field: 'type', header: type },
      { field: 'dimension', header: dimension },
      { field: 'price', header: price },
      { field: 'description', header: description },
      { field: 'options', header: options }
    ]
  }

  private mapTableRow(destination: Destination): DestinationsTableRow {
    return {
      id: destination.id,
      name: destination.name,
      type: destination.type,
      dimension: destination.dimension == 'unknown' ? '' : destination.dimension,
      price: destination.price,
      description: destination.description
    }
  }

  /**
  * Receives an array of destinations and turn it into an array of rows ready to display on a table.
  * @param destinations array of all the destinations
  * @returns an observable with all the rows of the table to be displayed
  */
  private mapDestinationsRows(destinations: Destination[]): Observable<DestinationsTableRow[]> {
    return of(destinations.map((destination: Destination) => this.mapTableRow(destination)));
  }

  public showDestinationForm(destination?: Destination) {
    if (destination) {
      this.selectedDestination = destination;
    }
    this.showEditForm = true;
  }

  private hideDestinationForm() {
    this.showEditForm = false;
  }

  public addOrEditDestination(destination: Destination) {
    if (destination.id) {
      this.destinationsFacade.updateDestination(destination);
    } else {
      this.destinationsFacade.addDestination(destination);
    }
    this.hideDestinationForm();
  }

  private deleteDestination(id: number) {
    this.destinationsFacade.deleteDestination(id);
  }

  showConfirmDialog(id: number) {
    this.confirmationSvc.confirm({
      message: '¿Desea eliminar el destino?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteDestination(id);
        this.messageSvc.add({ severity: 'success', summary: 'Confirmación', detail: 'Destino eliminado' });
      }
    });
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('DestinationsPage');
  }
}
