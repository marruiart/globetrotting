import { Component } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { catchError, lastValueFrom, of, switchMap, tap, zip } from "rxjs";
import { AgentsFacade } from "src/app/core/+state/agents/agents.facade";
import { AuthFacade } from "src/app/core/+state/auth/auth.facade";
import { AgentsTableRow } from "src/app/core/models/globetrotting/agent.interface";
import { AdminAgentOrClientUser, User, UserCredentials } from "src/app/core/models/globetrotting/user.interface";
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
  private readonly COMPONENT = 'AgentsManagementPage';

  public selectedAgent: AgentsTableRow | null = null;
  public isUpdating: boolean = false;
  public formType?: FormType;
  public showForm: boolean = false;
  public data: AgentsTableRow[] = [];
  public cols: any[] = [];

  constructor(
    private agentsSvc: AgentService,
    private userSvc: UsersService,
    private authSvc: AuthService,
    private subsSvc: SubscriptionsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translate: CustomTranslateService,
    public agentsFacade: AgentsFacade
  ) {
    this.agentsFacade.initAgents();
    this.subsSvc.addSubscriptions(this.COMPONENT,
      // Translations
      this.translate.language$.pipe(switchMap((_: string) => this.getCols()), catchError(err => of(err))).subscribe()
    )
  }

  private getCols() {
    const id$ = this.translate.getTranslation("agentsManagement.tableId");
    const name$ = this.translate.getTranslation("agentsManagement.tableName");
    const email$ = this.translate.getTranslation("agentsManagement.tableEmail");
    const options$ = this.translate.getTranslation("agentsManagement.tableOptions");

    const tableHeaders$ = zip(id$, name$, email$, options$).pipe(
      tap(([id, name, email, options]) => {
        this.cols = this.translateMenuItems(id, name, email, options);
      }), catchError(err => of(err)));
    return tableHeaders$;
  }

  private translateMenuItems(id: string, name: string, email: string, options: string) {
    return [
      { field: 'user_id', header: id },
      { field: 'name', header: name },
      { field: 'email', header: email },
      { field: 'options', header: options }
    ]
  }

  public async showAgentForm(formType: FormType, tableRow?: AgentsTableRow, actionUpdate: boolean = false) {
    this.formType = formType;
    this.isUpdating = actionUpdate;
    if (formType === 'UPDATE_AGENT' && tableRow?.ext_id) {
      this.selectedAgent = tableRow;
      this.showForm = true;
    } else if ( formType === 'REGISTER_AGENT') {
      this.showForm = true;
    } else {
      console.error("ERROR: The agent could not be selected.")
    }
  }

  private hideAgentForm() {
    this.formType = undefined;
    this.selectedAgent = null;
    this.showForm = false;
  }

  public async addOrEditAgent(agent: User & UserCredentials) {
    if (agent.ext_id) {
      await lastValueFrom(this.userSvc.updateUser(agent)).catch(err => console.error(err));
      //await lastValueFrom(this.authSvc.updateIdentifiers(agent)).catch(err => console.error(err)); // TODO check firebase with admin.auth().updateUser(uid, {email: "modifiedUser@example.com"});
      this.agentsFacade.initAgents();
    } else {
      await lastValueFrom(this.authSvc.register(agent, true)).catch(err => console.error(err));
    }
    this.hideAgentForm();
  }

  private async deleteAgent(extuser_id: number | string, user_id: number | string) {
    await lastValueFrom(this.agentsSvc.agentMe(user_id as number).pipe(switchMap(agent => {
      if (agent) {
        return this.agentsSvc.deleteAgent(agent.id);
      } else {
        throw new Error("ERROR: Agent not found");
      }
    })))
    await lastValueFrom(this.authSvc.deleteUser(user_id)).catch(err => console.error(err));
    await lastValueFrom(this.userSvc.deleteUser(extuser_id)).catch(err => console.error(err)); // TODO move this to userSvc, removing at once extended, permissions and agent (different for strapi)
  }

  showConfirmDialog(tableRow: AgentsTableRow) {
    this.confirmationService.confirm({
      message: '¿Desea eliminar el usuario? \nEsta acción devolverá al estado "sin confirmar" todas las reservas asociadas al agente.',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (tableRow.ext_id) {
          this.deleteAgent(tableRow.ext_id, tableRow.user_id); // TODO obtener los datos de este agent
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
