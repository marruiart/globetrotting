import { NgModule } from '@angular/core';

// Redux
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AgentsFacade } from './agents.facade';
import { AGENTS_FEATURE_KEY, agentsReducer } from './agents.reducer';
import { AgentsEffects } from './agents.effects';


@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature(AGENTS_FEATURE_KEY, agentsReducer),
    EffectsModule.forFeature([AgentsEffects]),
  ],
  providers: [
    AgentsFacade
  ]
})
export class AgentsModule { }
