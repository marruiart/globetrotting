import { createFeatureSelector, createSelector } from "@ngrx/store";
import { USER_FEATURE_KEY, UserState } from "./load-user.reducer";
import { selectCurrentRole, selectCurrentUserId } from "../auth/auth.selectors";
import { Client } from "../../models/globetrotting/client.interface";

export const selectFeature = createFeatureSelector<UserState>(USER_FEATURE_KEY);
export const selectCurrentExtendedUser = createSelector(selectFeature, (state: UserState) => state.extendedUser);
export const selectUserNickname = createSelector(selectFeature, (state: UserState) => state.extendedUser?.nickname);
export const selectUserAvatar = createSelector(selectFeature, (state: UserState) => state.extendedUser?.avatar);
export const selectUserBookings = createSelector(selectFeature, (state: UserState) => state.specificUser?.bookings);
export const selectUserFavorites = createSelector(selectFeature, (state: UserState) => {
    try {
        let client = state.specificUser as Client
        return client.favorites
    } catch (exc) {
        return null;
    }
});
export const selectCurrentSpecificUser = createSelector(selectFeature, (state: UserState) => state.specificUser);

export const selectCurrentUser = createSelector({
    user_id: selectCurrentUserId,
    role: selectCurrentRole,
    extendedUser: selectCurrentExtendedUser,
    specificUser: selectCurrentSpecificUser,
});