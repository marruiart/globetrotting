import { Injectable, inject } from "@angular/core";
import { Store, select } from "@ngrx/store";
import * as UserActions from './user.actions'
import * as AuthSelector from './user.selectors'
import { AuthUser } from "../../models/globetrotting/auth.interface";

@Injectable()
export class UserFacade {

    private readonly store = inject(Store);
    currentClient$ = this.store.pipe(select(AuthSelector.selectCurrentClient));
    currentAgent$ = this.store.pipe(select(AuthSelector.selectCurrentAgent));
    currentExtendedUser$ = this.store.pipe(select(AuthSelector.selectCurrentExtendedUser));
    currentUser$ = this.store.pipe(select(AuthSelector.selectCurrentUser));

    init(user: AuthUser) {
        this.store.dispatch(UserActions.initAssignUserData({ user: user }));
    }

}