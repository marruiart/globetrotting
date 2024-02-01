import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FirebaseUserRegisterInfo } from 'src/app/core/models/firebase-interfaces/firebase-user.interface';
import { FullUser, UserCredentials, UserCredentialsOptions, UserRegisterInfo, UserRegisterInfoOptions } from 'src/app/core/models/globetrotting/user.interface';
import { StrapiUserRegisterInfo } from 'src/app/core/models/strapi-interfaces/strapi-user.interface';
import { IdentifierValidator } from 'src/app/core/validators/identifier.validator';
import { PasswordValidator } from 'src/app/core/validators/password.validator';
import { BACKEND, BackendTypes } from 'src/environments/environment';

export type FormType = "LOGIN" | "REGISTER" | "REGISTER_AGENT" | "PROFILE" | "UPDATE_AGENT";
const Pattern = {
  EMAIL: "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$",
  NAME: "^[A-Za-z ]+$",
  NICKNAME: "^[A-Za-z0-9._-]+$"
}

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
      this.userForm.controls['username'].setValue(agent.username);
      this.userForm.controls['email'].setValue(agent.email);
      this.userForm.controls['name'].setValue(agent.name);
      this.userForm.controls['surname'].setValue(agent.surname);
      this.userForm.controls['nickname'].setValue(agent.nickname);
    }
  }
  @Input() set user(fullUser: FullUser | null) {
    if (fullUser) {
      this.userForm.controls['id'].setValue(fullUser.extendedUser?.id);
      this.userForm.controls['username'].setValue(fullUser.user?.username);
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
    private fb: FormBuilder,
    public translate: TranslateService
  ) { }

  initForm() {
    switch (this.formType) {
      case 'LOGIN':
        this.userForm = this.fb.group({
          email: ['', [Validators.pattern(Pattern.EMAIL)]],
          username: ['', [Validators.pattern(Pattern.NICKNAME)]],
          password: ['', [Validators.required, PasswordValidator.passwordProto('password')]]
        }, { validator: [IdentifierValidator.identifierRequired('email', 'username')] } as AbstractControlOptions);
        break;
      case 'REGISTER':
        this.userForm = this.fb.group({
          username: ['', [Validators.required, Validators.pattern(Pattern.NICKNAME)]],
          email: ['', [Validators.required, Validators.pattern(Pattern.EMAIL)]],
          password: ['', [Validators.required, PasswordValidator.passwordProto('password')]],
          passwordRepeat: ['', [Validators.required, PasswordValidator.passwordProto('passwordRepeat')]]
        }, { validator: [PasswordValidator.passwordMatch('password', 'passwordRepeat')] } as AbstractControlOptions);
        break;
      case 'REGISTER_AGENT':
        this.userForm = this.fb.group({
          id: [null],
          user_id: [null],
          username: ['', [Validators.required, Validators.pattern(Pattern.NICKNAME)]],
          email: ['', [Validators.required, Validators.pattern(Pattern.EMAIL)]],
          password: ['', [Validators.required, PasswordValidator.passwordProto('password')]],
          passwordRepeat: ['', [Validators.required, PasswordValidator.passwordProto('passwordRepeat')]],
          name: ['', [Validators.required, Validators.pattern(Pattern.NAME)]],
          surname: ['', [Validators.required, Validators.pattern(Pattern.NAME)]],
          nickname: ['', [Validators.required, Validators.pattern(Pattern.NICKNAME)]],
        }, { validator: [PasswordValidator.passwordMatch('password', 'passwordRepeat')] } as AbstractControlOptions);
        break;
      case 'PROFILE':
        this.userForm = this.fb.group({
          id: [null],
          user_id: [null],
          username: [{ value: '', disabled: true }],
          email: ['', [Validators.required]],
          password: ['', [PasswordValidator.passwordProto('password')]],
          passwordRepeat: ['', [PasswordValidator.passwordProto('passwordRepeat')]],
          name: ['', [Validators.required, Validators.pattern(Pattern.NAME)]],
          surname: ['', [Validators.required, Validators.pattern(Pattern.NAME)]],
          nickname: ['', [Validators.required, Validators.pattern(Pattern.NICKNAME)]],
        }, { validator: [PasswordValidator.passwordMatch('password', 'passwordRepeat')] } as AbstractControlOptions);
        break;
      case 'UPDATE_AGENT':
        this.userForm = this.fb.group({
          id: [null],
          user_id: [null],
          username: [{ value: '', disabled: true }],
          email: ['', [Validators.required, Validators.pattern(Pattern.EMAIL)]],
          name: ['', [Validators.required, Validators.pattern(Pattern.NAME)]],
          surname: ['', [Validators.required, Validators.pattern(Pattern.NAME)]],
          nickname: ['', [Validators.required, Validators.pattern(Pattern.NICKNAME)]],
        }, { validator: [PasswordValidator.passwordMatch('password', 'passwordRepeat')] } as AbstractControlOptions);
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
      case 'UPDATE_AGENT':
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
      specificUser: null // TODO change this
    };
    this.onUpdateProfileClicked.emit(fullUser);
  }

  private onRegisterAgent(event: Event) {
    event.stopPropagation();
    const credentials: any = {
      user_id: this.userForm.value.user_id,
      username: this.userForm.value.username,
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
    const credentials = this.getUserRegisterInfo(BACKEND) as UserRegisterInfo
    this.onRegisterClicked.emit(credentials);
  }

  private onLogin(event: Event) {
    event.stopPropagation();
    let credentials = this.getUserCredentials(BACKEND) as UserCredentials;
    this.onLoginClicked.emit(credentials);
  }

  public onNavigateToRegister() {
    this.onNavigateToRegisterClicked.emit();
  }

  ngOnDestroy(): void {
    this._subs.forEach(s => s.unsubscribe());
  }

  private getUserCredentials(backend: BackendTypes): UserCredentialsOptions {
    if (backend == 'Firebase') {
      return {
        email: this.userForm.value.email ?? '',
        password: this.userForm.value.password
      }
    } else if (backend == 'Strapi') {
      return {
        username: this.userForm.value.username ?? '',
        email: this.userForm.value.email ?? '',
        password: this.userForm.value.password
      }
    }
    else {
      throw new Error('Backend not implemented');
    }
  }

  private getUserRegisterInfo(backend: BackendTypes): UserRegisterInfoOptions {
    switch (backend) {
      case 'Firebase':
        let firebaseRegister: FirebaseUserRegisterInfo = {
          uid: '',
          username: this.userForm.value.username,
          email: this.userForm.value.email,
          password: this.userForm.value.password
        }
        return firebaseRegister;
      case 'Strapi':
        let strapiRegister: StrapiUserRegisterInfo =
        {
          username: this.userForm.value.username,
          email: this.userForm.value.email,
          password: this.userForm.value.password
        }
        return strapiRegister;
      default: throw new Error('Backend not implemented');
    }
  }

}