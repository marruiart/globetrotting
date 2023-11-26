import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import * as UserActions from './load-user.actions'
import * as AuthSelector from './load-user.selectors'
import { AuthUser } from "../../models/globetrotting/auth.interface";

@Injectable()
export class UserFacade {

    private readonly store = inject(Store);
    currentSpecificUser$ = this.store.pipe(select(AuthSelector.selectCurrentSpecificUser));
    currentExtendedUser$ = this.store.pipe(select(AuthSelector.selectCurrentExtendedUser));
    currentUser$ = this.store.pipe(select(AuthSelector.selectCurrentUser));

    init(user: AuthUser) {
        this.store.dispatch(UserActions.loadUser({ user: user }));
    }

}