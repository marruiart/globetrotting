import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { AuthFacade } from '../libs/auth/auth.facade';

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
      const agentPermissions = role == 'AGENT' || role == 'ADMIN';
      const adminPermissions = role == 'ADMIN';
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
