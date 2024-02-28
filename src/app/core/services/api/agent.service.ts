import { Injectable, inject } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { ApiService } from './api.service';
import { MappingService } from './mapping.service';
import { TravelAgent, NewTravelAgent, PaginatedAgent } from '../../models/globetrotting/agent.interface';
import { DataService } from './data.service';
import { AgentsFacade } from '../../+state/agents/agents.facade';
import { DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { AuthFacade } from '../../+state/auth/auth.facade';
import { AdminAgentOrClientUser } from '../../models/globetrotting/user.interface';
import { Roles } from '../../utilities/utilities';

@Injectable({
  providedIn: 'root'
})
export class AgentService extends ApiService {
  protected agentsFacade = inject(AgentsFacade);
  protected authFacade = inject(AuthFacade);
  private path: string = "/api/agents";

  private _user: AdminAgentOrClientUser | null = null;
  private _next: DocumentSnapshot<DocumentData> | number | null = null;
  public _agents: TravelAgent[] = [];
  private queries: { [query: string]: string } = {
    "populate": "bookings,user"
  }
  private body = (agent: NewTravelAgent) => this.mappingSvc.mapAgentPayload(agent);

  constructor(
    protected dataSvc: DataService,
    protected mappingSvc: MappingService
  ) {
    super();
    this.authFacade.currentUser$.subscribe(user => this._user = user);
  }

  public getAllAgents(page: number | null = 1): Observable<PaginatedAgent | null> {
    if (page == null) {
      return of(null);
    }
    let _queries = JSON.parse(JSON.stringify(this.queries));
    _queries["pagination[page]"] = `${page}`;
    return this.dataSvc.obtainAll<PaginatedAgent>(this.path, _queries, this.mappingSvc.mapPaginatedAgents)
      .pipe(tap((page: PaginatedAgent) => {
        if (page.data.length > 0) {
          let _newAgents: TravelAgent[] = JSON.parse(JSON.stringify(page.data))
            .reduce((prev: TravelAgent[], data: TravelAgent): TravelAgent[] => {
              // Check if each of the new elements already existed, if not, push them into _agents
              let foundAgent = this._agents.find(agent => agent.id == data.id);
              if (!foundAgent) {
                prev.push(data);
              }
              return prev;
            }, JSON.parse(JSON.stringify(this._agents)));
          if (this._user?.role === Roles.ADMIN) {
            this.agentsFacade.retrieveAgentInfo(_newAgents);
          }
        }
      }));
  }

  public agentMe(id: number | null): Observable<TravelAgent | null> {
    if (id) {
      let _queries = JSON.parse(JSON.stringify(this.queries));
      _queries["filters[user]"] = `${id}`;
      return this.dataSvc.obtainAll<PaginatedAgent>(this.path, _queries, this.mappingSvc.mapPaginatedAgents)
        .pipe(map(res => {
          if (res.data.length > 0) {
            let agentMe = res.data[0];
            return agentMe;
          } else {
            return null;
          }
        }))
    } else {
      return of(null);
    }
  }

  public getAgent(id: string | number): Observable<TravelAgent> {
    return this.dataSvc.obtain<TravelAgent>(this.path, id, this.mappingSvc.mapAgent, this.queries);
  }

  public addAgent(agent: NewTravelAgent, updateObs: boolean = true): Observable<TravelAgent> {
    return this.dataSvc.save<TravelAgent>(this.path, this.body(agent), this.mappingSvc.mapAgent).pipe(tap(_ => {
      if (updateObs) {
        this.getAllAgents().subscribe();
      }
    }));
  }

  public updateAgent(agent: TravelAgent, updateObs: boolean = true): Observable<TravelAgent> {
    return this.dataSvc.update<TravelAgent>(this.path, agent.id, this.body(agent), this.mappingSvc.mapAgent).pipe(tap(_ => {
      if (updateObs) {
        this.getAllAgents().subscribe();
      }
    }));
  }

  public deleteAgent(id: number | string): Observable<TravelAgent> {
    return this.dataSvc.delete<TravelAgent>(this.path, this.mappingSvc.mapAgent, id, {}).pipe(tap(res => {
      let _newAgents = JSON.parse(JSON.stringify(this._agents));
      const index = this._agents.findIndex(agent => agent.id == res.id);
      if (index != -1) {
        _newAgents.splice(index, 1);
      }
      this.getAllAgents().subscribe();
    }));
  }

}
