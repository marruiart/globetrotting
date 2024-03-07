import { Component, OnDestroy } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { catchError, lastValueFrom, map, of, switchMap, tap, zip } from "rxjs";
import { AuthFacade } from "src/app/core/+state/auth/auth.facade";
import { DestinationsFacade } from "src/app/core/+state/destinations/destinations.facade";
import { Destination, DestinationsTableRow } from "src/app/core/models/globetrotting/destination.interface";
import { MappingService } from "src/app/core/services/api/mapping.service";
import { CustomTranslateService } from "src/app/core/services/custom-translate.service";
import { SubscriptionsService } from "src/app/core/services/subscriptions.service";
import { Roles } from "src/app/core/utilities/utilities";


@Component({
  selector: 'app-destinations-management',
  templateUrl: './destinations-management.page.html',
  styleUrls: ['./destinations-management.page.scss'],
})
export class DestinationsManagementPage implements OnDestroy {
  private readonly COMPONENT = 'DestinationsManagementPage';

  public loading: boolean = false;
  public data: DestinationsTableRow[] = [];
  public cols: any[] = [];
  public showEditForm: boolean = false;
  public selectedDestination: Destination | null = null;

  constructor(
    // Services
    private subsSvc: SubscriptionsService,
    private mappingSvc: MappingService,
    private translate: CustomTranslateService,
    // Facades
    public destinationsFacade: DestinationsFacade,
    private authFacade: AuthFacade,
    // PrimeNG
    private confirmationSvc: ConfirmationService,
    private messageSvc: MessageService
  ) {
    this.destinationsFacade.initDestinations();
    this.subsSvc.addSubscriptions(this.COMPONENT,
      // Fetch data
      this.authFacade.currentUser$.pipe(switchMap(user => {
        const role = user?.role;
        if (role === Roles.AGENT || role === Roles.ADMIN) {
          return this.destinationsFacade.destinationsPage$.pipe(map(page => {
            const destinations: Destination[] = page.data;
            const table: DestinationsTableRow[] = destinations.map(destination => this.mappingSvc.mapDestinationTableRow(destination));
            this.destinationsFacade.saveDestinationsManagementTable(table);
          }), catchError(err => { console.error(err); throw new Error(err) }));
        } else {
          return of();
        }
      })).subscribe(),
      // Translation
      this.translate.language$.pipe(switchMap((_: string) => this.getCols()), catchError(err => { console.error(err); throw new Error(err) })).subscribe()
    )
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
      }), catchError(err => { throw new Error(err) }));

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

  public showDestinationForm(destination?: Destination) {
    this.selectedDestination = destination ?? null;
    this.showEditForm = true;
  }

  private hideDestinationForm() {
    this.selectedDestination = null;
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

  async showConfirmDialog(id: number) {
    const message = await lastValueFrom(this.translate.getTranslation("destManagement.deleteMessage"));
    const confirmation = await lastValueFrom(this.translate.getTranslation("destManagement.deleteConfirmationTitle"));
    const detail = await lastValueFrom(this.translate.getTranslation("destManagement.deleteDetailMessage"));
    
    this.confirmationSvc.confirm({
      message: message,
      header: confirmation,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteDestination(id);
        this.messageSvc.add({ severity: 'success', summary: confirmation, detail: detail });
      }
    });
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe(this.COMPONENT);
  }
}
