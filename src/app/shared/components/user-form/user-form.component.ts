import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FullUser, UserCredentials, UserRegisterInfo } from 'src/app/core/models/globetrotting/user.interface';

type FormType = "LOGIN" | "REGISTER" | "REGISTER_AGENT" | "PROFILE";

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnDestroy {
  private _subs: Subscription[] = []
  public userForm: FormGroup = this.fb.group({});;
  public errMsg: string = "";
  private _formType: FormType | null = null;
  @Input() set formType(formType: FormType | null) {
    this._formType = formType;
    if (this.formType) {
      this.initForm();
    }
  }
  public get formType() {
    return this._formType;
  }
  private _actionUpdate: boolean = false;
  @Input() set actionUpdate(actionUpdate: boolean) {
    this._actionUpdate = actionUpdate;
  }
  public get actionUpdate() {
    return this._actionUpdate;
  }
  @Input() set agent(agent: any | null) {
    if (agent) {
      this.userForm.controls['id'].setValue(agent.id);
      this.userForm.controls['user_id'].setValue(agent.user_id);
      this.userForm.controls['email'].setValue(agent.email);
      this.userForm.controls['name'].setValue(agent.name);
      this.userForm.controls['surname'].setValue(agent.surname);
      this.userForm.controls['nickname'].setValue(agent.nickname);
    }
  }
  @Input() set user(fullUser: FullUser | null) {
    if (fullUser) {
      this.userForm.controls['id'].setValue(fullUser.extendedUser?.id);
      this.userForm.controls['user_id'].setValue(fullUser.user?.id);
      this.userForm.controls['email'].setValue(fullUser.user?.email);
      this.userForm.controls['name'].setValue(fullUser.extendedUser?.name);
      this.userForm.controls['surname'].setValue(fullUser.extendedUser?.surname);
      this.userForm.controls['nickname'].setValue(fullUser.extendedUser?.nickname);
    }
  }
  @Output() onLoginClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRegisterClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRegisterAgentClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() onNavigateToRegisterClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() onUpdateProfileClicked: EventEmitter<any> = new EventEmitter<any>();


  constructor(
    private fb: FormBuilder
  ) { }

  initForm() {
    switch (this.formType) {
      case 'LOGIN':
        this.userForm = this.fb.group({
          username: ['', [
            Validators.required,
            Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
          ]],
          password: ['', Validators.required]
        });
        break;
      case 'REGISTER':
        this.userForm = this.fb.group({
          email: ['', [
            Validators.required,
            Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
          ]],
          password: ['', Validators.required],
          passwordRepeat: ['', Validators.required]
        });
        break;
      case 'REGISTER_AGENT':
        this.userForm = this.fb.group({
          id: [null],
          user_id: [null],
          email: [{ value: '', disabled: true }, [, Validators.required]],
          password: ['', [Validators.required]],
          passwordRepeat: ['', [Validators.required]],
          name: ['', [Validators.required]],
          surname: ['', [Validators.required]],
          nickname: ['', [Validators.required]],
        });
        break;
      case 'PROFILE':
        this.userForm = this.fb.group({
          id: [null],
          user_id: [null],
          email: ['', [Validators.required]],
          password: ['', [Validators.required]],
          passwordRepeat: ['', [Validators.required]],
          name: ['', [Validators.required]],
          surname: ['', [Validators.required]],
          nickname: ['', [Validators.required]],
        });
        break;
      default:
        this.userForm = this.fb.group({});
        console.error("Error al asignar el formulario");
    }
  }

  public onSubmit(event: Event) {
    switch (this.formType) {
      case 'LOGIN':
        this.onLogin(event);
        break;
      case 'REGISTER':
        this.onRegister(event);
        break;
      case 'REGISTER_AGENT':
        this.onRegisterAgent(event);
        break;
      case 'PROFILE':
        this.onUpdateProfile(event);
        break;
      default:
        console.error("Error al enviar el formulario");
    }
  }

  private onUpdateProfile(event: Event) {
    event.stopPropagation();
    const fullUser: FullUser = {
      user: {
        id: this.userForm.value.user_id,
        email: this.userForm.value.email,
        username: this.userForm.value.username,
        password: this.userForm.value.password
      },
      extendedUser: {
        id: this.userForm.value.id,
        nickname: this.userForm.value.nickname,
        name: this.userForm.value.name,
        surname: this.userForm.value.surname
      },
      specificUser: null
    };
    this.onUpdateProfileClicked.emit(fullUser);
  }

  private onRegisterAgent(event: Event) {
    event.stopPropagation();
    const credentials: any = {
      user_id: this.userForm.value.user_id,
      username: this.userForm.value.email,
      email: this.userForm.value.email,
      password: this.userForm.value.password,
      id: this.userForm.value.id,
      name: this.userForm.value.name,
      surname: this.userForm.value.surname,
      nickname: this.userForm.value.nickname
    }
    this.onRegisterAgentClicked.emit(credentials);
  }

  private onRegister(event: Event) {
    event.stopPropagation();
    const credentials: UserRegisterInfo = {
      username: this.userForm.value.email,
      email: this.userForm.value.email,
      password: this.userForm.value.password
    }
    this.onRegisterClicked.emit(credentials);
  }

  private onLogin(event: Event) {
    event.stopPropagation();
    const credentials: UserCredentials = {
      username: this.userForm.value.username,
      password: this.userForm.value.password
    }
    this.onLoginClicked.emit(credentials);
  }

  public onNavigateToRegister() {
    this.onNavigateToRegisterClicked.emit();
  }

  ngOnDestroy(): void {
    this._subs.forEach(s => s.unsubscribe());
  }

}