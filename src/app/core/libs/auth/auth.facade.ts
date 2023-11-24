import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import { UserCredentials, UserRegisterInfo } from "../../models/globetrotting/user.interface";
import * as AuthAction from './auth.actions'
import * as AuthSelector from './auth.selectors'
import { Auth, AuthUser } from "../../models/globetrotting/auth.interface";

@Injectable()
export class AuthFacade {

    private readonly store = inject(Store);
    role$ = this.store.pipe(select(AuthSelector.selectCurrentUserRole))

    init(/* user: AuthUser */) {
        this.store.dispatch(AuthAction.init());
        //this.store.dispatch(AuthAction.assignRole({ user: user }));
    }

    login(credentials: UserCredentials) {
        this.store.dispatch(AuthAction.login({ credentials: credentials }));
    }

    logout() {
        this.store.dispatch(AuthAction.logout());
    }

    register(registerInfo: UserRegisterInfo) {
        this.store.dispatch(AuthAction.register({ registerInfo: registerInfo }));
    }

}