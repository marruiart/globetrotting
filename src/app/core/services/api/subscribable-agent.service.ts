import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MappingService } from './mapping.service';
import { PaginatedAgent } from '../../models/globetrotting/agent.interface';
import { DataService } from './data.service';
import { AgentService } from './agent.service';
import { Unsubscribe } from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseCollectionResponse } from '../../models/firebase-interfaces/firebase-data.interface';
import { AgentUser } from '../../models/globetrotting/user.interface';

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
    super(dataSvc, mappingSvc)
    if (!this.unsubscribe) {
      this.subscribeToAgents();
    }
  }

  private subscribeToAgents() {
    const _agents = new BehaviorSubject<FirebaseCollectionResponse | null>(null);
    this.unsubscribe = this.firebaseSvc.subscribeToCollection('agents_users', _agents);
    _agents.subscribe(res => {
      if (res) {
        const agents = res.docs.map(doc => this.mappingSvc.mapUser(doc) as AgentUser);
        this.agentsFacade.saveAgents(agents);
      }
    });
  }

  public override getAllAgents(page: number | null = 1): Observable<PaginatedAgent | null> {
    return of(null);
  }
}
