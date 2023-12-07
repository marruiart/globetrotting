import { Component, OnInit } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { BehaviorSubject, Observable, lastValueFrom } from "rxjs";
import { UserFacade } from "src/app/core/libs/load-user/load-user.facade";
import { TravelAgent } from "src/app/core/models/globetrotting/agent.interface";
import { Client } from "src/app/core/models/globetrotting/client.interface";
import { Destination } from "src/app/core/models/globetrotting/destination.interface";
import { DestinationsService } from "src/app/core/services/api/destinations.service";
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
    private messageService: MessageService
  ) {
    this.subsSvc.addSubscription({
      component: 'DestinationsPage',
      sub: this.userFacade.currentSpecificUser$.subscribe(currentUser => {
        this.currentUser = currentUser;
      })
    })
  }


  async ngOnInit() {
    this.cols = this.getCols();
    if (this.currentUser?.type == 'AGENT') {
      let destinations = await lastValueFrom(this.destinationsSvc.getAllDestinations());
      destinations.data.forEach(destination => {
        this.mapTableRow(destination);
      })
      this._destinationTable.next(this.mappedDestinations);
    }
  }

  private getCols() {
    return [
      { field: 'name', header: 'Destino' },
      { field: 'type', header: 'Tipo' },
      { field: 'dimension', header: 'Dimensión' },
      { field: 'price', header: 'Precio' },
      { field: 'description', header: 'Descripción' },
      { field: 'options', header: 'Opciones' }
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
