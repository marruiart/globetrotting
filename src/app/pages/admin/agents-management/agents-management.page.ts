import { Component, OnInit } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { BehaviorSubject, Observable, catchError, concatMap, lastValueFrom, map, of, switchMap } from "rxjs";
import { UserFacade } from "src/app/core/libs/load-user/load-user.facade";
import { TravelAgent } from "src/app/core/models/globetrotting/agent.interface";
import { Client } from "src/app/core/models/globetrotting/client.interface";
import { ExtUser, UserCredentials } from "src/app/core/models/globetrotting/user.interface";
import { AgentService } from "src/app/core/services/api/agent.service";
import { UsersService } from "src/app/core/services/api/users.service";
import { AuthService } from "src/app/core/services/auth/auth.service";
import { SubscriptionsService } from "src/app/core/services/subscriptions.service";


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
export class AgentsManagementPage implements OnInit {
  private mappedAgents: TableRow[] = [];
  private _agentTable: BehaviorSubject<TableRow[]> = new BehaviorSubject<TableRow[]>([]);
  public agentTable$: Observable<TableRow[]> = this._agentTable.asObservable();

  public selectedAgent: TableRow | null = null;
  public isUpdating: boolean = false;
  public currentUser: Client | TravelAgent | null = null;
  public showEditForm: boolean = false;
  public data: TableRow[] = [];
  public cols: any[] = [];

  constructor(
    private agentsSvc: AgentService,
    private userSvc: UsersService,
    private authSvc: AuthService,
    private userFacade: UserFacade,
    private subsSvc: SubscriptionsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.subsSvc.addSubscription({
      component: 'AgentsManagementPage',
      sub: this.userFacade.currentSpecificUser$.subscribe(currentUser => {
        this.currentUser = currentUser;
      })
    })
  }

  async ngOnInit() {
    this.cols = this.getCols();
    if (this.currentUser?.type == 'AGENT') {
      let agents = await lastValueFrom(this.agentsSvc.getAllAgents());
      if (agents) {
        agents.data.forEach(agent => {
          this.mapTableRow(agent);
        })
      }
      this._agentTable.next(this.mappedAgents);
    }
  }

  private getCols() {
    return [
      { field: 'agent_id', header: 'Identificador' },
      { field: 'name', header: 'Nombre' },
      { field: 'surname', header: 'Apellidos' },
      { field: 'email', header: 'Email' },
      { field: 'options', header: 'Opciones' }
    ]
  }

  private mapTableRow(agent: TravelAgent) {
    const extUser$ = this.userSvc.getAgentUser(agent.user_id);

    this.subsSvc.addSubscription({
      component: 'AgentsManagementPage',
      sub: extUser$.pipe(
        concatMap((extUser: ExtUser | null): Observable<TableRow | null> => {
          if (extUser && extUser.user_id) {
            return this.authSvc.getUserIdentifiers(extUser.user_id).pipe(
              concatMap((user: UserCredentials): Observable<TableRow | null> => {
                if (user) {
                  const tableRow: TableRow = {
                    id: extUser.id,
                    user_id: user.id,
                    agent_id: agent.id,
                    name: extUser.name ?? "",
                    surname: extUser.surname ?? "",
                    email: user.email ?? "",
                    username: user.username,
                    nickname: extUser.nickname
                  }
                  return of(tableRow);
                }
                return of(null);
              }), catchError(err => {
                console.error(err);
                return of(null);
              })
            );
          }
          return of(null);
        }), catchError(err => {
          console.error(err);
          return of(null);
        })).subscribe((tableRow: TableRow | null) => {
          if (tableRow) {
            this.mappedAgents.push(tableRow);
          }
          return this.mappedAgents;
        })
    });
  }

  public showAgentForm(tableRow?: TableRow, actionUpdate: boolean = false) {
    if (tableRow && tableRow.user_id) {
      this.selectedAgent = tableRow;
    }
    this.isUpdating = actionUpdate;
    this.showEditForm = true;
  }

  private hideAgentForm() {
    this.showEditForm = false;
  }

  public addOrEditAgent(agent: any) {
    if (agent.id) {
      const extUser = {
        id: agent.id,
        name: agent.name,
        surname: agent.surname,
        nickname: agent.nickname
      }
      const identifiers = {
        id: agent.user_id,
        email: agent.email,
      }
      lastValueFrom(this.userSvc.updateUser(extUser))
        .catch(err => console.error(err));
      lastValueFrom(this.authSvc.updateIdentifiers(identifiers))
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
    lastValueFrom(this.userSvc.deleteUser(extuser_id))
      .catch(err => console.error(err));
    lastValueFrom(this.authSvc.deleteUser(user_id))
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
