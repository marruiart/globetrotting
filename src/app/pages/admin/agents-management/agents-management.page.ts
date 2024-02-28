import { Component } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { catchError, lastValueFrom, of, switchMap, tap, zip } from "rxjs";
import { AgentsFacade } from "src/app/core/+state/agents/agents.facade";
import { AuthFacade } from "src/app/core/+state/auth/auth.facade";
import { AgentsTableRow } from "src/app/core/models/globetrotting/agent.interface";
import { AdminAgentOrClientUser } from "src/app/core/models/globetrotting/user.interface";
import { AgentService } from "src/app/core/services/api/agent.service";
import { UsersService } from "src/app/core/services/api/users.service";
import { AuthService } from "src/app/core/services/auth/auth.service";
import { CustomTranslateService } from "src/app/core/services/custom-translate.service";
import { SubscriptionsService } from "src/app/core/services/subscriptions.service";
import { FormType } from "src/app/shared/components/user-form/user-form.component";

@Component({
  selector: 'app-agents-management',
  templateUrl: './agents-management.page.html',
  styleUrls: ['./agents-management.page.scss'],
})
export class AgentsManagementPage {

  public selectedAgent: AgentsTableRow | null = null;
  public isUpdating: boolean = false;
  public formType!: FormType;
  public currentUser: AdminAgentOrClientUser | null = null;
  public showForm: boolean = false;
  public data: AgentsTableRow[] = [];
  public cols: any[] = [];

  constructor(
    private agentsSvc: AgentService,
    private userSvc: UsersService,
    private authSvc: AuthService,
    private authFacade: AuthFacade,
    private subsSvc: SubscriptionsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translate: CustomTranslateService,
    public agentsFacade: AgentsFacade
  ) {
    this.init();
    this.subsSvc.addSubscriptions('AgentsManagementPage',
      this.authFacade.currentUser$.subscribe(currentUser => this.currentUser = currentUser),
      this.translate.language$.pipe(switchMap((_: string) => this.getCols()), catchError(err => of(err))).subscribe()
    )
  }

  private async init() {
    await lastValueFrom(this.agentsSvc.getAllAgents()).catch(err => console.error(err));
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

  public showAgentForm(formType: FormType, tableRow?: AgentsTableRow, actionUpdate: boolean = false) {
    if (tableRow && tableRow.agent_id) {
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

  private deleteAgent(agent_id: number | string, extuser_id: number | string, user_id: number | string) {
    lastValueFrom(this.agentsSvc.deleteAgent(agent_id))
      .catch(err => console.error(err));
    lastValueFrom(this.authSvc.deleteUser(user_id))
      .catch(err => console.error(err));
    lastValueFrom(this.userSvc.deleteUser(extuser_id))
      .catch(err => console.error(err));
  }

  showConfirmDialog(tableRow: AgentsTableRow) {
    this.confirmationService.confirm({
      message: '¿Desea eliminar el usuario? \nEsta acción devolverá al estado "sin confirmar" todas las reservas asociadas al agente.',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (tableRow.agent_id) {
          //this.deleteAgent(tableRow.agent_id, tableRow.id, tableRow.user_id); // TODO obtener los datos de este agent
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
