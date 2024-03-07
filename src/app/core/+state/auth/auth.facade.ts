import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import { AdminAgentOrClientUser, UserCredentials, UserRegisterInfo } from "../../models/globetrotting/user.interface";
import * as AuthActions from './auth.actions'
import * as AuthSelector from './auth.selectors'
import { Role } from "../../utilities/utilities";

@Injectable()
export class AuthFacade {

    private readonly store = inject(Store);
    isLogged$ = this.store.pipe(select(AuthSelector.selectLoggedState));
    currentUser$ = this.store.pipe(select(AuthSelector.selectCurrentUser));
    userId$ = this.store.pipe(select(AuthSelector.selectUserId));
    role$ = this.store.pipe(select(AuthSelector.selectRole));
    nickname$ = this.store.pipe(select(AuthSelector.selectUserNickname));
    avatar$ = this.store.pipe(select(AuthSelector.selectUserAvatar));
    favorites$ = this.store.pipe(select(AuthSelector.selectUserFavorites));
    error$ = this.store.pipe(select(AuthSelector.selectError));

    init() {
        // Just for Strapi
        this.store.dispatch(AuthActions.init());
    }

    login(credentials: UserCredentials) {
        this.store.dispatch(AuthActions.login({ credentials }));
    }

    navigate(role: Role) {
        this.store.dispatch(AuthActions.navigate({ role }));
    }

    updateUser(user: AdminAgentOrClientUser, isFirstTime: boolean) {
        this.store.dispatch(AuthActions.updateUser({ user }));
        if (isFirstTime) {
            this.store.dispatch(AuthActions.navigate({ role: user.role }));
        }
    }

    setLoginStateTrue() {
        this.store.dispatch(AuthActions.loginSuccess());
    }

    logout() {
        this.store.dispatch(AuthActions.logout());
    }

    register(registerInfo: UserRegisterInfo, isAgent: boolean = false) {
        this.store.dispatch(AuthActions.register({ registerInfo, isAgent }));
    }

    registerAgent(registerInfo: UserRegisterInfo) {
        this.register(registerInfo, true);
    }

}