import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import { User, UserCredentials, UserRegisterInfo } from "../../models/globetrotting/user.interface";
import * as AuthActions from './auth.actions'
import * as AuthSelector from './auth.selectors'

@Injectable()
export class AuthFacade {

    private readonly store = inject(Store);
    isLogged$ = this.store.pipe(select(AuthSelector.selectLoggedState));
    authUser$ = this.store.pipe(select(AuthSelector.selectAuthUser));
    userId$ = this.store.pipe(select(AuthSelector.selectUserId));
    role$ = this.store.pipe(select(AuthSelector.selectRole));
    currentUser$ = this.store.pipe(select(AuthSelector.selectUser));
    nickname$ = this.store.pipe(select(AuthSelector.selectUserNickname));
    avatar$ = this.store.pipe(select(AuthSelector.selectUserAvatar));
    bookings$ = this.store.pipe(select(AuthSelector.selectUserBookings));
    favorites$ = this.store.pipe(select(AuthSelector.selectUserFavorites));
    error$ = this.store.pipe(select(AuthSelector.selectError));

    init() {
        this.store.dispatch(AuthActions.init());
    }

    login(credentials: UserCredentials) {
        this.store.dispatch(AuthActions.login({ credentials }));
    }

    saveUserUid(uid: string) {
        this.store.dispatch(AuthActions.assignUid({ user_id: uid }));
        this.init();
    }

    updateUser(user: User) {
        this.store.dispatch(AuthActions.updateUser({ user }));
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