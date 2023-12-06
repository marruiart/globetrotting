import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User, AgentRegisterInfo } from 'src/app/core/models/globetrotting/user.interface';

@Component({
  selector: 'app-agent-form',
  templateUrl: './agent-form.component.html',
  styleUrls: ['./agent-form.component.scss'],
})
export class AgentFormComponent {
  public form: FormGroup;
  private _agent: any = null;
  @Input() set agent(agent: any) {
    this._agent = agent;
    if (agent) {
      this.form.controls['id'].setValue(agent.id);
      this.form.controls['email'].setValue(agent.email);
      this.form.controls['password'].setValue(agent.password);
      this.form.controls['passwordRepeat'].setValue(agent.passwordRepeat);
      this.form.controls['name'].setValue(agent.name);
      this.form.controls['surname'].setValue(agent.surname);
      this.form.controls['nickname'].setValue(agent.nickname);
    }
  }

  @Output() onAgentFormAccepted: EventEmitter<AgentRegisterInfo> = new EventEmitter<AgentRegisterInfo>();

  constructor(
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      id: [null],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      passwordRepeat: ['', [Validators.required]],
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      nickname: ['', [Validators.required]],
    });
  }

  public onAccept(event: Event) {
    const agent: AgentRegisterInfo = {
      id: this.form.value.id,
      email: this.form.value.email,
      username: this.form.value.email,
      password: this.form.value.password,
      name: this.form.value.name,
      surname: this.form.value.surname,
      nickname: this.form.value.nickname
    }
    this.onAgentFormAccepted.emit(agent);
    event.stopPropagation();
  }

}
