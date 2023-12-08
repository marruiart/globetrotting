import { Component, OnInit } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { BehaviorSubject, Observable, catchError, lastValueFrom, of, switchMap, tap, zip } from "rxjs";
import { UserFacade } from "src/app/core/libs/load-user/load-user.facade";
import { TravelAgent } from "src/app/core/models/globetrotting/agent.interface";
import { Client } from "src/app/core/models/globetrotting/client.interface";
import { Destination } from "src/app/core/models/globetrotting/destination.interface";
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
export class DestinationsManagementPage implements OnInit {
  public selectedDestination: Destination | null = null;
  public currentUser: Client | TravelAgent | null = null;
  private mappedDestinations: TableRow[] = [];
  private _destinationTable: BehaviorSubject<TableRow[]> = new BehaviorSubject<TableRow[]>([]);
  public showEditForm: boolean = false;
  public destinationTable$: Observable<TableRow[]> = this._destinationTable.asObservable();
  public data: TableRow[] = [];
  public cols: any[] = [];

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
      }
    ])
  }


  async ngOnInit() {
    if (this.currentUser?.type == 'AGENT') {
      let destinations = await lastValueFrom(this.destinationsSvc.getAllDestinations());
      destinations.data.forEach(destination => {
        this.mapTableRow(destination);
      })
      this._destinationTable.next(this.mappedDestinations);
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
    const clientTableRow: TableRow = {
      id: destination.id,
      name: destination.name,
      type: destination.type,
      dimension: destination.dimension,
      price: destination.price,
      description: destination.description
    }
    this.mappedDestinations.push(clientTableRow);
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