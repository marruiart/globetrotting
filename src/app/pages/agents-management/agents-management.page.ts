import { Component, OnInit } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { BehaviorSubject, Observable, catchError, lastValueFrom, map, of, switchMap, tap } from "rxjs";
import { UserFacade } from "src/app/core/libs/load-user/load-user.facade";
import { TravelAgent } from "src/app/core/models/globetrotting/agent.interface";
import { Client } from "src/app/core/models/globetrotting/client.interface";
import { AgentRegisterInfo, User } from "src/app/core/models/globetrotting/user.interface";
import { AgentService } from "src/app/core/services/api/agent.service";
import { UsersService } from "src/app/core/services/api/users.service";
import { AuthService } from "src/app/core/services/auth/auth.service";
import { SubscriptionsService } from "src/app/core/services/subscriptions.service";


interface TableRow {
  id: number,
  agent_id: number,
  name: string,
  surname: string
}


@Component({
  selector: 'app-agents-management',
  templateUrl: './agents-management.page.html',
  styleUrls: ['./agents-management.page.scss'],
})
export class AgentsManagementPage implements OnInit {
  public selectedAgent: User | null = null;
  public currentUser: Client | TravelAgent | null = null;
  private mappedAgents: TableRow[] = [];
  private _agentTable: BehaviorSubject<TableRow[]> = new BehaviorSubject<TableRow[]>([]);
  public showEditForm: boolean = false;
  public agentTable$: Observable<TableRow[]> = this._agentTable.asObservable();
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
          this.mapTableRow(of(agent));
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
      { field: 'options', header: 'Opciones' }
    ]
  }

  private mapTableRow(agent$: Observable<TravelAgent>) {
    agent$.pipe(
      switchMap((agent: TravelAgent): Observable<TableRow | null> => {
        return this.userSvc.getAgentUser(agent.user_id)
          .pipe(map((user: User | null) => {
            if (user) {
              const tableRow: TableRow = {
                id: user.id,
                agent_id: agent.id,
                name: user.name ?? "",
                surname: user.surname ?? ""
              }
              return tableRow;
            }
            return null;
          }), catchError(err => {
            console.error(err);
            return of(null);
          }));
      }), catchError(err => {
        console.error(err);
        return of(null);
      })).subscribe(tableRow => {
        if (tableRow) {
          this.mappedAgents.push(tableRow)
        }
        return this.mappedAgents;
      });
  }

  public showAgentForm(agent?: User) {
    if (agent) {
      this.selectedAgent = agent;
    }
    this.showEditForm = true;
  }

  private hideAgentForm() {
    this.showEditForm = false;
  }

  public addOrEditAgent(agent: AgentRegisterInfo) {
    if (agent.id) {
      lastValueFrom(this.userSvc.updateUser(agent))
        .catch(err => console.error(err));
    } else {
      lastValueFrom(this.authSvc.register(agent, true))
        .catch(err => console.error(err));
    }
    this.hideAgentForm();
  }

  private deleteAgent(id: number) {
    lastValueFrom(this.agentsSvc.deleteAgent(id))
      .catch(err => console.error(err));
  }

  showConfirmDialog(id: number) {
    this.confirmationService.confirm({
      message: '¿Desea eliminar el usuario?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteAgent(id);
        this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: 'Usuario eliminado' });
      }
    });
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe('AgentsManagementPage');
  }
}
