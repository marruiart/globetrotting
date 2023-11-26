import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';
import { FavClickedEvent } from 'src/app/pages/destinations/destinations.page';

@Component({
  selector: 'app-destination-card',
  templateUrl: './destination-card.component.html',
  styleUrls: ['./destination-card.component.scss'],
})
export class DestinationCardComponent {
  private _destination!: Destination;
  private _isClient: boolean = false;
  public fav: boolean = false;

  @Input() set destination(destination: any) {
    this.fav = destination.fav;
    this._destination = destination;
  }
  get destination() {
    return this._destination;
  }

  @Input() set isClient(isClient: boolean) {
    this._isClient = isClient;
  }
  get isClient() {
    return this._isClient;
  }

  @Output() onFavClicked: EventEmitter<FavClickedEvent> = new EventEmitter<FavClickedEvent>();

  public updateFav(event: Event) {
    this.onFavClicked.emit({ fav: !this.fav });
    this.fav = !this.fav;
    event.stopPropagation();
  }

}
