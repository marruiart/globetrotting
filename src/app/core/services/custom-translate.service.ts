import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomTranslateService {
  private _language: BehaviorSubject<string> = new BehaviorSubject<string>('es');
  public language$ = this._language.asObservable();

  constructor(
    private translate: TranslateService
  ) { 
    this.init()
  }

  private async init() {
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang(this._language.value);
  }

  public changeLanguage(language:string) {
    return this.translate.use(language).pipe(tap(_ => {
      this._language.next(language);
    }))
  }

  public getTranslation(key: string) {
    return this.translate.get(key);
  }

}
