import { Component, OnInit } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { BehaviorSubject, Observable, catchError, lastValueFrom, of, switchMap, tap, zip } from "rxjs";
import { UserFacade } from "src/app/core/+state/load-user/load-user.facade";
import { TravelAgent } from "src/app/core/models/globetrotting/agent.interface";
import { Client } from "src/app/core/models/globetrotting/client.interface";
import { Destination, PaginatedDestination } from "src/app/core/models/globetrotting/destination.interface";
import { DestinationsService } from "src/app/core/services/api/destinations.service";
import { CustomTranslateService } from "src/app/core/services/custom-translate.service";
import { SubscriptionsService } from "src/app/core/services/subscriptions.service";


interface TableRow {
  id: number,
  name: string,
  type?: string,
  dimension?: string,
  price?: number,
  description?: string
}

@Component({
  selector: 'app-destinations-management',
  templateUrl: './destinations-management.page.html',
  styleUrls: ['./destinations-management.page.scss'],
})
export class DestinationsManagementPage {
  private _destinationTable: BehaviorSubject<TableRow[]> = new BehaviorSubject<TableRow[]>(new Array(10));
  public destinationTable$: Observable<TableRow[]> = this._destinationTable.asObservable();

  public loading: boolean = false;
  public data: TableRow[] = [];
  public cols: any[] = [];
  public currentUser: Client | TravelAgent | null = null;
  public showEditForm: boolean = false;
  public selectedDestination: Destination | null = null;

  constructor(
    private destinationsSvc: DestinationsService,
    private userFacade: UserFacade,
    private subsSvc: SubscriptionsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translate: CustomTranslateService
  ) {


    this.subsSvc.addSubscriptions([
      {
        component: 'DestinationsPage',
        sub: this.userFacade.currentSpecificUser$
          .subscribe(currentUser => {
            this.currentUser = currentUser;
          })
      },
      {
        component: 'DestinationsPage',
        sub: this.translate.language$.pipe(
          switchMap((_: string) => this.getCols()),
          catchError(err => of(err)))
          .subscribe()
      },
      {
        component: 'DestinationsPage',
        sub: this.destinationsSvc.getAllDestinations().subscribe()
      },
      {
        component: 'DestinationsPage',
        sub: this.displayTable().subscribe((table: TableRow[]) => {
          this._destinationTable.next(table);
        })
      }
    ])
  }

  /**
* Obtains from the agent service an array of destinations and maps each of them into a TableRow.
* @returns an observable of an array of TableRow.
*/
  private displayTable(): Observable<TableRow[]> {
    if (this.currentUser?.type == 'AGENT') {
      return this.destinationsSvc.destinationsPage$.pipe(
        switchMap((page: PaginatedDestination): Observable<TableRow[]> => this.mapDestinationsRows(page.data)),
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

  private mapTableRow(destination: Destination) {
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
  private mapDestinationsRows(destinations: Destination[]): Observable<TableRow[]> {
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
      lastValueFrom(this.destinationsSvc.updateDestination(destination))
        .catch(err => console.error(err));
    } else {
      lastValueFrom(this.destinationsSvc.addDestination(destination))
        .catch(err => console.error(err));
    }
    this.hideDestinationForm();
  }

  private deleteDestination(id: number) {
    lastValueFrom(this.destinationsSvc.deleteDestination(id))
      .catch(err => console.error(err));
  }

  showConfirmDialog(id: number) {
    this.confirmationService.confirm({
      message: '¿Desea eliminar el destino?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteDestination(id);
        this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: 'Destino eliminado' });
      }
    });
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('DestinationsPage');
  }
}
