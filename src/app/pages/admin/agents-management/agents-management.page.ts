import { Component } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { BehaviorSubject, Observable, catchError, forkJoin, lastValueFrom, of, switchMap, tap, zip } from "rxjs";
import { AuthFacade } from "src/app/core/+state/auth/auth.facade";
import { PaginatedAgent, TravelAgent } from "src/app/core/models/globetrotting/agent.interface";
import { ExtUser, User, UserCredentials } from "src/app/core/models/globetrotting/user.interface";
import { AgentService } from "src/app/core/services/api/agent.service";
import { UsersService } from "src/app/core/services/api/users.service";
import { AuthService } from "src/app/core/services/auth/auth.service";
import { CustomTranslateService } from "src/app/core/services/custom-translate.service";
import { SubscriptionsService } from "src/app/core/services/subscriptions.service";
import { FormType } from "src/app/shared/components/user-form/user-form.component";

interface TableRow {
  id: number,
  user_id?: number,
  agent_id: number,
  name: string,
  surname: string,
  email: string,
  username: string,
  nickname: string
}

@Component({
  selector: 'app-agents-management',
  templateUrl: './agents-management.page.html',
  styleUrls: ['./agents-management.page.scss'],
})
export class AgentsManagementPage {
  private _agentTable: BehaviorSubject<TableRow[]> = new BehaviorSubject<TableRow[]>(new Array(10));
  public agentTable$: Observable<TableRow[]> = this._agentTable.asObservable();

  public selectedAgent: TableRow | null = null;
  public isUpdating: boolean = false;
  public formType!: FormType;
  public currentUser: User | null = null; // TODO clases de esto
  public showForm: boolean = false;
  public data: TableRow[] = [];
  public cols: any[] = [];

  constructor(
    private agentsSvc: AgentService,
    private userSvc: UsersService,
    private authSvc: AuthService,
    private authFacade: AuthFacade,
    private subsSvc: SubscriptionsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translate: CustomTranslateService
  ) {
    this.subsSvc.addSubscriptions([
      {
        component: 'AgentsManagementPage',
        sub: this.authFacade.currentUser$.subscribe(currentUser => {
          this.currentUser = currentUser;
        })
      },
      {
        component: 'AgentsManagementPage',
        sub: this.translate.language$.pipe(
          switchMap((_: string) => this.getCols()),
          catchError(err => of(err))
        ).subscribe()
      },
      {
        component: 'AgentsManagementPage',
        sub: this.agentsSvc.getAllAgents().subscribe()
      },
      {
        component: 'AgentsManagementPage',
        sub: this.displayTable().subscribe((table: TableRow[]) => {
          this._agentTable.next(table);
        })
      }
    ])
  }

  /**
   * Obtains from the agent service an array of agents and maps each of them into a TableRow.
   * @returns an observable of an array of TableRow.
   */
  private displayTable(): Observable<TableRow[]> {
    if (this.currentUser?.role === 'AGENT') {
      return this.agentsSvc.agentsPage$.pipe(
        switchMap((page: PaginatedAgent | null): Observable<TableRow[]> => this.mapAgentsRows(page?.data ?? [])),
        catchError(err => of(err))
      )
    } else {
      return of([]);
    }
  }

  private getCols() {
    const name$ = this.translate.getTranslation("agentsManagement.tableId");
    const surname$ = this.translate.getTranslation("agentsManagement.tableName");
    const email$ = this.translate.getTranslation("agentsManagement.tableSurname");
    const options$ = this.translate.getTranslation("agentsManagement.tableEmail");
    const identification$ = this.translate.getTranslation("agentsManagement.tableOptions");

    const tableHeaders$ = zip(identification$, name$, surname$, email$, options$).pipe(
      tap(([
        identification,
        name,
        surname,
        email,
        options
      ]) => {
        this.cols = this.translateMenuItems(name, surname, email, options, identification);
      }), catchError(err => of(err)));

    return tableHeaders$;
  }

  private translateMenuItems(identification: string, name: string, surname: string, email: string, options: string) {
    return [
      { field: 'agent_id', header: identification },
      { field: 'name', header: name },
      { field: 'email', header: email },
      { field: 'options', header: options }]
  }

  private mapTableRow(agent: TravelAgent, extUser: ExtUser, user: UserCredentials): TableRow {
    throw new Error('Method not implemented');

    /*return {
      id: extUser.id,
      user_id: user.id,
      agent_id: agent.id,
      name: extUser.name ?? "",
      surname: extUser.surname ?? "",
      email: user.email ?? "",
      username: user.username,
      nickname: extUser.nickname
    }*/
  }

  /**
 * Receives an array of travel agents and turn it into an array of rows ready to display on a table.
 * @param agents array of all the travel agents
 * @returns an observable with all the rows of the table to be displayed
 */
  private mapAgentsRows(agents: TravelAgent[]): Observable<TableRow[]> {
    throw new Error('Method not implemented');
    let tableRowObs: Observable<TableRow>[] = [];

    for (let agent of agents) {
      const extUser$ = this.userSvc.getAgentUser(agent.user_id);
      // For each booking, add a TableRow observable
      /*tableRowObs.push(extUser$.pipe(
        switchMap((extUser): Observable<TableRow> => {
          if (extUser && extUser.user_id) {
            return this.authSvc.getUserIdentifiers(extUser.user_id).pipe(
              switchMap((user: UserCredentials): Observable<TableRow> => {
                if (user) {
                  return of(this.mapTableRow(agent, extUser, user));
                }
                return throwError(() => "No se han podido obtener las credenciales del usuario");
              })
            )
          }
          return throwError(() => "No se han podido obtener los datos del extended user");
        }), catchError(err => {
          return of(err);
        })))*/
    }
    // ForkJoin the "array of observables" to return "an observable of an array"
    return forkJoin(tableRowObs);
  }

  public showAgentForm(formType: FormType, tableRow?: TableRow, actionUpdate: boolean = false) {
    if (tableRow && tableRow.user_id) {
      this.selectedAgent = tableRow;
    }
    this.formType = formType;
    this.isUpdating = actionUpdate;
    this.showForm = true;
  }

  private hideAgentForm() {
    this.showForm = false;
  }

  public addOrEditAgent(agent: any) {
    // TODO -> improve returning with an object of TravelAgent and UserCredentials
    if (agent.id) {
      const extUser = {
        id: agent.id,
        name: agent.name,
        surname: agent.surname,
        nickname: agent.nickname
      }
      const identifiers = {
        id: agent.user_id,
        username: agent.username,
        email: agent.email,
      }
      lastValueFrom(this.userSvc.updateUser(extUser))
        .catch(err => console.error(err));
      lastValueFrom(this.authSvc.updateIdentifiers(identifiers))
        .catch(err => console.error(err));
      lastValueFrom(this.agentsSvc.getAllAgents())
        .catch(err => console.error(err));
    } else {
      lastValueFrom(this.authSvc.register(agent, true))
        .catch(err => console.error(err));
    }
    this.hideAgentForm();
  }

  private deleteAgent(agent_id: number, extuser_id: number, user_id: number) {
    lastValueFrom(this.agentsSvc.deleteAgent(agent_id))
      .catch(err => console.error(err));
    lastValueFrom(this.authSvc.deleteUser(user_id))
      .catch(err => console.error(err));
    lastValueFrom(this.userSvc.deleteUser(extuser_id))
      .catch(err => console.error(err));
  }

  showConfirmDialog(tableRow: TableRow) {
    this.confirmationService.confirm({
      message: '¿Desea eliminar el usuario? \nEsta acción devolverá al estado "sin confirmar" todas las reservas asociadas al agente.',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (tableRow.user_id) {
          this.deleteAgent(tableRow.agent_id, tableRow.id, tableRow.user_id);
          this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: 'Usuario eliminado' });
        } else {
          console.error("El usuario no pudo ser eliminado, se desconoce el id asociado");
        }
      }
    });
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('AgentsManagementPage');
  }
}
