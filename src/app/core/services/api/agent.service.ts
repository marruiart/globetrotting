import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';
import { ApiService } from './api.service';
import { MappingService } from './mapping.service';
import { TravelAgent, NewTravelAgent, PaginatedAgent } from '../../models/globetrotting/agent.interface';
import { UserFacade } from '../../libs/load-user/load-user.facade';

@Injectable({
  providedIn: 'root'
})
export class AgentService extends ApiService {
  private path: string = "/api/agents";

  private _page: BehaviorSubject<PaginatedAgent | null> = new BehaviorSubject<PaginatedAgent | null>(null);
  public page$: Observable<PaginatedAgent | null> = this._page.asObservable();
  private _agents: BehaviorSubject<TravelAgent[]> = new BehaviorSubject<TravelAgent[]>([]);
  public agents$: Observable<TravelAgent[]> = this._agents.asObservable();
  private queries: { [query: string]: string } = {
    "populate": "bookings,user"
  }
  private body = (agent: NewTravelAgent) => this.mapSvc.mapAgentPayload(agent);

  constructor(
    private mapSvc: MappingService,
    private userFacade: UserFacade
  ) {
    super();
  }

  public getAllAgents(page: number | null = 1): Observable<PaginatedAgent | null> {
    if (page == null) {
      return of(null);
    }
    let _queries = JSON.parse(JSON.stringify(this.queries));
    _queries["pagination[page]"] = `${page}`;
    return this.getAll<PaginatedAgent>(this.path, _queries, this.mapSvc.mapPaginatedAgents)
      .pipe(tap((page: PaginatedAgent) => {
        if (page.data.length > 0) {
          let _agents: TravelAgent[] = JSON.parse(JSON.stringify(page.data))
            .reduce((prev: TravelAgent[], data: TravelAgent): TravelAgent[] => {
              // Check if each of the new elements already existed, if not, push them into _agents
              if (this._agents.value.find(c => c.id == data.id) == undefined) {
                prev.push(data);
              }
              return prev;
            }, JSON.parse(JSON.stringify(this._agents.value)));
          this._agents.next(_agents);
          this._page.next(page);
        }
      }));
  }

  public agentMe(id: number | null): Observable<TravelAgent | null> {
    if (id) {
      let _queries = JSON.parse(JSON.stringify(this.queries));
      _queries["filters[user]"] = `${id}`;
      return this.getAll<PaginatedAgent>(this.path, _queries, this.mapSvc.mapPaginatedAgents)
        .pipe(map(res => {
          if (res.data.length > 0) {
            let agentMe = res.data[0];
            this.userFacade.updateSpecificUser(agentMe);
            return agentMe;
          } else {
            return null;
          }
        }))
    } else {
      return of(null);
    }
  }

  public getAgent(id: number): Observable<TravelAgent> {
    return this.get<TravelAgent>(this.path, id, this.mapSvc.mapAgent, this.queries);
  }

  public addAgent(agent: NewTravelAgent, updateObs: boolean = true): Observable<TravelAgent> {
    return this.add<TravelAgent>(this.path, this.body(agent), this.mapSvc.mapAgent).pipe(tap(_ => {
      if (updateObs) {
        this.getAllAgents().subscribe();
      }
    }));
  }

  public updateAgent(agent: TravelAgent, updateObs: boolean = true): Observable<TravelAgent> {
    return this.update<TravelAgent>(this.path, agent.id, this.body(agent), this.mapSvc.mapAgent).pipe(tap(_ => {
      if (updateObs) {
        this.getAllAgents().subscribe();
      }
    }));
  }

  public deleteAgent(id: number): Observable<TravelAgent> {
    return this.delete<TravelAgent>(this.path, this.mapSvc.mapAgent, id).pipe(tap(_ => {
      this.getAllAgents().subscribe();
    }));;
  }

}
