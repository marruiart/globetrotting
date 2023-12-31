import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import { UserCredentials, UserRegisterInfo } from "../../models/globetrotting/user.interface";
import * as AuthAction from './auth.actions'
import * as AuthSelector from './auth.selectors'

@Injectable()
export class AuthFacade {

    private readonly store = inject(Store);
    userId$ = this.store.pipe(select(AuthSelector.selectCurrentUserId));
    isLogged$ = this.store.pipe(select(AuthSelector.selectLoggedState));
    role$ = this.store.pipe(select(AuthSelector.selectCurrentRole));

    init() {
        this.store.dispatch(AuthAction.init());
    }

    login(credentials: UserCredentials) {
        this.store.dispatch(AuthAction.login({ credentials: credentials }));
    }

    setLoginStateTrue() {
        this.store.dispatch(AuthAction.loginSuccess());
    }

    logout() {
        this.store.dispatch(AuthAction.logout());
    }

    register(registerInfo: UserRegisterInfo) {
        this.store.dispatch(AuthAction.register({ registerInfo: registerInfo }));
    }

}