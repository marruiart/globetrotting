import { Component } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { catchError, lastValueFrom, of, switchMap, tap, zip } from "rxjs";
import { AgentsFacade } from "src/app/core/+state/agents/agents.facade";
import { AgentsTableRow } from "src/app/core/models/globetrotting/agent.interface";
import { User, UserCredentials } from "src/app/core/models/globetrotting/user.interface";
import { UsersService } from "src/app/core/services/api/users.service";
import { AuthService } from "src/app/core/services/auth/auth.service";
import { CustomTranslateService } from "src/app/core/services/custom-translate.service";
import { SubscriptionsService } from "src/app/core/services/subscriptions.service";
import { FormType, FormTypes } from "src/app/core/utilities/utilities";

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
    private userSvc: UsersService,
    private authSvc: AuthService,
    private subsSvc: SubscriptionsService,
    private confirmationSvc: ConfirmationService,
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
    if (formType === FormTypes.UPDATE_AGENT && tableRow?.ext_id) {
      this.selectedAgent = tableRow;
      this.showForm = true;
    } else if (formType === FormTypes.REGISTER_AGENT) {
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

  private async deleteAgent(ext_id: number | string, user_id: number | string) {
    await lastValueFrom(this.authSvc.deleteUser(user_id, ext_id, true)).catch(err => console.error(err));
    this.agentsFacade.initAgents();
  }

  showConfirmDialog(tableRow: AgentsTableRow) {
    this.confirmationSvc.confirm({
      message: '¿Desea eliminar el usuario? \nEsta acción devolverá al estado "sin confirmar" todas las reservas asociadas al agente.',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (tableRow.ext_id) {
          this.deleteAgent(tableRow.ext_id, tableRow.user_id); // TODO obtener los datos de este agent
          this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: 'Usuario eliminado' });
        } else {
          console.error("ERROR: Unknown user id. The user could not be deleted.");
        }
      }
    });
  }

  ngOnDestroy() {
    this.subsSvc.unsubscribe(this.COMPONENT);
  }
}
