import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';
import { ApiService } from './api.service';
import { MappingService } from './mapping.service';
import { Agent, NewAgent, PaginatedAgent } from '../../models/globetrotting/agent.interface';
import { UserFacade } from '../../libs/load-user/load-user.facade';

@Injectable({
  providedIn: 'root'
})
export class AgentService extends ApiService {
  private path: string = "/api/agents";

  private _page: BehaviorSubject<PaginatedAgent | null> = new BehaviorSubject<PaginatedAgent | null>(null);
  public page$: Observable<PaginatedAgent | null> = this._page.asObservable();
  private _agents: BehaviorSubject<Agent[]> = new BehaviorSubject<Agent[]>([]);
  public agents$: Observable<Agent[]> = this._agents.asObservable();
  private queries: { [query: string]: string } = {
    "populate": "bookings,user"
  }

  private body: any = (agent: Agent) => {
    return {
      data: {
        bookings: agent.bookings
      }
    }
  }

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
          let _agents: Agent[] = JSON.parse(JSON.stringify(page.data))
            .reduce((prev: Agent[], data: Agent): Agent[] => {
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

  public agentMe(id: number | null): Observable<Agent | null> {
    if (id) {
      let _queries = JSON.parse(JSON.stringify(this.queries));
      _queries["filters[user_id]"] = `${id}`;
      _queries["populate"] = "bookings";
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

  public getAgent(id: number): Observable<Agent> {
    return this.get<Agent>(this.path, id, this.mapSvc.mapAgent, this.queries);
  }

  public addAgent(agent: NewAgent, updateObs: boolean = true): Observable<Agent> {
    return this.add<Agent>(this.path, this.body(agent), this.mapSvc.mapAgent).pipe(tap(_ => {
      if (updateObs) {
        this.getAllAgents().subscribe();
      }
    }));
  }

  public updateAgent(agent: Agent, updateObs: boolean = true): Observable<Agent> {
    return this.update<Agent>(this.path, agent.id, this.body(agent), this.mapSvc.mapAgent).pipe(tap(_ => {
      if (updateObs) {
        this.getAllAgents().subscribe();
      }
    }));
  }

  public deleteAgent(id: number): Observable<Agent> {
    return this.delete<Agent>(this.path, this.mapSvc.mapAgent, id).pipe(tap(_ => {
      this.getAllAgents().subscribe();
    }));;
  }

}
