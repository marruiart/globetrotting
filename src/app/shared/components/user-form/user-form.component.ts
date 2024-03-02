import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FirebaseUserRegisterInfo } from 'src/app/core/models/firebase-interfaces/firebase-user.interface';
import { AgentsTableRow } from 'src/app/core/models/globetrotting/agent.interface';
import { AdminAgentOrClientUser, User, UserCredentials, UserCredentialsOptions, UserRegisterInfo, UserRegisterInfoOptions } from 'src/app/core/models/globetrotting/user.interface';
import { StrapiUserRegisterInfo } from 'src/app/core/models/strapi-interfaces/strapi-user.interface';
import { SubscriptionsService } from 'src/app/core/services/subscriptions.service';
import { Backends, FormType, FormTypes, Roles } from 'src/app/core/utilities/utilities';
import { IdentifierValidator } from 'src/app/core/validators/identifier.validator';
import { PasswordValidator } from 'src/app/core/validators/password.validator';
import { BACKEND, environment } from 'src/environments/environment';
import { BackendTypes } from 'src/environments/environment.prod';

type FormChange = { [control: string]: boolean };
export type FormChanges = { formChanges: FormChange | null };

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnDestroy {
  private readonly COMPONENT = 'UserFormComponent';
  private readonly Pattern = {
    EMAIL: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$',
    NAME: '^[A-Za-zÀ-ÖØ-öø-ÿ ]+$',
    NICKNAME: '^[A-Za-z0-9._-]+$'
  }
  private formChanges: FormChange = {};
  public userForm: FormGroup = this.fb.group({});;
  public errMsg: string = '';
  public backend = environment.backend as BackendTypes;

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

  @Input() set agent(tableRow: AgentsTableRow) {
    if (tableRow) {
      this.userForm.controls['id'].setValue(tableRow.ext_id);
      this.userForm.controls['user_id'].setValue(tableRow.user_id);
      this.userForm.controls['username'].setValue(tableRow.username);
      this.userForm.controls['_username'].setValue(tableRow.username);
      this.userForm.controls['email'].setValue(tableRow.email);
      this.userForm.controls['_email'].setValue(tableRow.email);
      this.userForm.controls['name'].setValue(tableRow.name);
      this.userForm.controls['surname'].setValue(tableRow.surname);
      this.userForm.controls['nickname'].setValue(tableRow.nickname);
    }
    if (this._actionUpdate) {
      this.onCreateGroupFormValueChange('name', 'surname', 'nickname');
    }
  }

  private _user!: AdminAgentOrClientUser;
  @Input() set user(user: AdminAgentOrClientUser | null) {
    if (user) {
      this._user = user;
      this.userForm.controls['id'].setValue(user.ext_id);
      this.userForm.controls['username'].setValue(user.username);
      this.userForm.controls['_username'].setValue(user.username);
      this.userForm.controls['user_id'].setValue(user.user_id);
      this.userForm.controls['email'].setValue(user.email);
      this.userForm.controls['_email'].setValue(user.email);
      this.userForm.controls['name'].setValue(user.name);
      this.userForm.controls['surname'].setValue(user.surname);
      this.userForm.controls['nickname'].setValue(user.nickname);
      if (user.role === Roles.AUTHENTICATED) {
        this.userForm.controls['favorites'].setValue(user.favorites);
      }
    }
    if (this._actionUpdate) {
      this.onCreateGroupFormValueChange('name', 'surname', 'nickname', 'password');
    }
  }

  @Output() onLoginClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRegisterClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRegisterAgentClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() onNavigateToRegisterClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() onUpdateProfileClicked: EventEmitter<User & UserCredentials & FormChanges> = new EventEmitter<User & UserCredentials & FormChanges>();

  constructor(
    private fb: FormBuilder,
    private subsSvc: SubscriptionsService,
    public translate: TranslateService
  ) { }

  initForm() {
    switch (this.formType) {
      case FormTypes.LOGIN:
        this.userForm = this.fb.group({
          email: ['', [Validators.pattern(this.Pattern.EMAIL)]],
          username: ['', [Validators.pattern(this.Pattern.NICKNAME)]],
          password: ['', [Validators.required, PasswordValidator.passwordProto('password')]]
        }, { validator: [IdentifierValidator.identifierRequired('email', 'username')] } as AbstractControlOptions);
        break;
      case FormTypes.REGISTER:
        this.userForm = this.fb.group({
          username: ['', [Validators.required, Validators.pattern(this.Pattern.NICKNAME)]],
          email: ['', [Validators.required, Validators.pattern(this.Pattern.EMAIL)]],
          password: ['', [Validators.required, PasswordValidator.passwordProto('password')]],
          passwordRepeat: ['', [Validators.required, PasswordValidator.passwordProto('passwordRepeat')]]
        }, { validator: [PasswordValidator.passwordMatch('password', 'passwordRepeat')] } as AbstractControlOptions);
        break;
      case FormTypes.REGISTER_AGENT:
        this.userForm = this.fb.group({
          id: [null],
          user_id: [null],
          username: ['', [Validators.required, Validators.pattern(this.Pattern.NICKNAME)]],
          email: ['', [Validators.required, Validators.pattern(this.Pattern.EMAIL)]],
          password: ['', [Validators.required, PasswordValidator.passwordProto('password')]],
          passwordRepeat: ['', [Validators.required, PasswordValidator.passwordProto('passwordRepeat')]],
          name: ['', [Validators.required, Validators.pattern(this.Pattern.NAME)]],
          surname: ['', [Validators.required, Validators.pattern(this.Pattern.NAME)]],
          nickname: ['', [Validators.required, Validators.pattern(this.Pattern.NICKNAME)]],
        }, { validator: [PasswordValidator.passwordMatch('password', 'passwordRepeat')] } as AbstractControlOptions);
        break;
      case FormTypes.PROFILE:
        this.userForm = this.fb.group({
          id: [null],
          user_id: [null],
          username: [{ value: '', disabled: true }],
          _username: ['', [Validators.required]],
          email: [{ value: '', disabled: true }],
          _email: ['', [Validators.required, Validators.pattern(this.Pattern.EMAIL)]],
          password: ['', [Validators.required, PasswordValidator.passwordProto('password')]],
          passwordRepeat: ['', [Validators.required, PasswordValidator.passwordProto('passwordRepeat')]],
          name: ['', [Validators.required, Validators.pattern(this.Pattern.NAME)]],
          surname: ['', [Validators.required, Validators.pattern(this.Pattern.NAME)]],
          nickname: ['', [Validators.required, Validators.pattern(this.Pattern.NICKNAME)]],
          favorites: [[]]
        }, { validator: [PasswordValidator.passwordMatch('password', 'passwordRepeat')] } as AbstractControlOptions);
        break;
      case FormTypes.UPDATE_AGENT:
        this.userForm = this.fb.group({
          id: [null],
          user_id: [null],
          username: [{ value: '', disabled: true }],
          _username: ['', [Validators.required, Validators.pattern(this.Pattern.NICKNAME)]],
          email: [{ value: '', disabled: true }],
          _email: ['', [Validators.required, Validators.pattern(this.Pattern.EMAIL)]],
          name: ['', [Validators.required, Validators.pattern(this.Pattern.NAME)]],
          surname: ['', [Validators.required, Validators.pattern(this.Pattern.NAME)]],
          nickname: ['', [Validators.required, Validators.pattern(this.Pattern.NICKNAME)]],
        });
    }
  }

  onCreateGroupFormValueChange(...formControlNames: string[]) {
    const initialValue = this.userForm.value;
    formControlNames.forEach(name => {
      const formControl = this.userForm.controls[name];
      this.formChanges[name] = false;
      this.subsSvc.addSubscriptions(this.COMPONENT,
        formControl.valueChanges.subscribe(value => {
          this.formChanges[name] = initialValue[name] !== value;
          console.log(initialValue[name], value);
          console.log(this.formChanges);
        }))
    })
  }

  public onSubmit(event: Event) {
    switch (this.formType) {
      case FormTypes.LOGIN:
        this.onLogin(event);
        break;
      case FormTypes.REGISTER:
        this.onRegister(event);
        break;
      case FormTypes.REGISTER_AGENT:
      case FormTypes.UPDATE_AGENT:
        this.onRegisterOrUpdateAgent(event);
        break;
      case FormTypes.PROFILE:
        this.onUpdateProfile(event);
        break;
      default:
        console.error("ERROR: Unexpected error. Unable to send the form.");
    }
  }

  private onUpdateProfile(event: Event) {
    event.stopPropagation();
    const user: User & UserCredentials & FormChanges = {
      role: this._user.role,
      user_id: this.userForm.value.user_id,
      ext_id: this.userForm.value.id,
      username: this.userForm.value.username ?? this.userForm.value._username,
      email: this.userForm.value.email ?? this.userForm.value._email,
      password: this.userForm.value.password,
      nickname: this.userForm.value.nickname,
      name: this.userForm.value.name,
      surname: this.userForm.value.surname,
      formChanges: Object.values(this.formChanges).some(value => value) ? this.formChanges : null
    }

    this.onUpdateProfileClicked.emit(user);
  }

  private onRegisterOrUpdateAgent(event: Event) {
    event.stopPropagation();
    const agent: User & UserCredentials = {
      role: Roles.AGENT,
      user_id: this.userForm.value.user_id,
      ext_id: this.userForm.value.id,
      username: this.userForm.value.username ?? this.userForm.value._username,
      email: this.userForm.value.email ?? this.userForm.value._email,
      password: this.userForm.value.password,
      nickname: this.userForm.value.nickname,
      name: this.userForm.value.name,
      surname: this.userForm.value.surname
    }
    this.onRegisterAgentClicked.emit(agent);
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

  private getUserCredentials(backend: BackendTypes): UserCredentialsOptions {
    // TODO call mapping service to get payload
    if (backend == Backends.FIREBASE) {
      return {
        email: this.userForm.value.email ?? '',
        password: this.userForm.value.password
      }
    } else if (backend == Backends.STRAPI) {
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
      case Backends.FIREBASE:
        let firebaseRegister: FirebaseUserRegisterInfo = {
          username: this.userForm.value.username,
          email: this.userForm.value.email,
          password: this.userForm.value.password
        }
        return firebaseRegister;
      case Backends.STRAPI:
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

  ngOnDestroy(): void {
    this.subsSvc.unsubscribe(this.COMPONENT);
  }

}