import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { MappingService } from './mapping.service';
import { PaginatedAgent } from '../../models/globetrotting/agent.interface';
import { DataService } from './data.service';
import { AgentService } from './agent.service';
import { QueryConstraint, Unsubscribe, orderBy, where } from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseCollectionResponse } from '../../models/firebase-interfaces/firebase-data.interface';
import { AgentUser } from '../../models/globetrotting/user.interface';
import { Collections, Roles } from '../../utilities/utilities';

@Injectable({
  providedIn: 'root'
})
export class SubscribableAgentService extends AgentService {
  private unsubscribe!: Unsubscribe | null;
  private firebaseSvc = inject(FirebaseService);

  constructor(
    dataSvc: DataService,
    mappingSvc: MappingService,
  ) {
    super(dataSvc, mappingSvc);
    this.authFacade.currentUser$.pipe(tap(user => {
      if (!this.unsubscribe && user?.role === Roles.ADMIN) {
        this.subscribeToAgents();
      } else if (!user) {
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
        }
      }
    })).subscribe();
  }

  private subscribeToAgents() {
    const _agents = new BehaviorSubject<FirebaseCollectionResponse | null>(null);
    const filterAgents: QueryConstraint = where('role', '!=', Roles.AUTHENTICATED);
    const orderByRole = orderBy('role');
    this.unsubscribe = this.firebaseSvc.subscribeToCollectionQuery(Collections.USERS, _agents, orderByRole, filterAgents);
    _agents.subscribe(res => {
      if (res) {
        const agents = res.docs.map(doc => this.mappingSvc.mapAdminAgentOrClientUser(doc) as AgentUser);
        this.agentsFacade.saveAgents(agents);
      }
    });
  }

  public override getAllAgents(page: number | null = 1): Observable<PaginatedAgent | null> {
    return of(null);
  }
}
