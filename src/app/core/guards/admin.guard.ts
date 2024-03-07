import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthFacade } from '../+state/auth/auth.facade';
import { Roles } from '../utilities/utilities';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authFacade: AuthFacade,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authFacade.role$.pipe(map(role => {
      const url = state.url;
      const agentPermissions = role === Roles.AGENT || role === Roles.ADMIN;
      const adminPermissions = role === Roles.ADMIN;
      if (url == '/admin/agents-management' && adminPermissions) {
        return true;
      } else if (url == '/admin/agents-management' && agentPermissions) {
        this.router.navigate(['/admin']);
        return true;
      } else {
        if (!agentPermissions) {
          this.router.navigate(['/home']);
        }
        return agentPermissions;
      }
    }));

  }

}
