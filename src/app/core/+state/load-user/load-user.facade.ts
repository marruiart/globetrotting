import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import * as UserActions from './load-user.actions'
import * as AuthSelector from './load-user.selectors'
import { AuthUser } from "../../models/globetrotting/auth.interface";
import { Client } from "../../models/globetrotting/client.interface";
import { TravelAgent } from "../../models/globetrotting/agent.interface";
import { Router } from "@angular/router";

@Injectable()
export class UserFacade {

    private readonly store = inject(Store);
    currentUser$ = this.store.pipe(select(AuthSelector.selectCurrentUser));
    currentSpecificUser$ = this.store.pipe(select(AuthSelector.selectCurrentSpecificUser));
    currentExtendedUser$ = this.store.pipe(select(AuthSelector.selectCurrentExtendedUser));
    nickname$ = this.store.pipe(select(AuthSelector.selectUserNickname));
    avatar$ = this.store.pipe(select(AuthSelector.selectUserAvatar));
    bookings$ = this.store.pipe(select(AuthSelector.selectUserBookings));
    favorites$ = this.store.pipe(select(AuthSelector.selectUserFavorites));

    constructor(private router: Router) { }

    init(user: AuthUser) {
        this.store.dispatch(UserActions.loadUser({ user: user, redirectUrl: this.router.url }));
    }

    loadExtendedUser(id: number) {
        this.store.dispatch(UserActions.loadExtendedUser({ user_id: id }));
    }

    loadSpecificUser(id: number, role: string) {
        this.store.dispatch(UserActions.loadSpecificUser({ user_id: id, role: role }));
    }

    updateSpecificUser(user: Client | TravelAgent | null) {
        this.store.dispatch(UserActions.updateSpecificUser({ specificUser: user }));
    }

}