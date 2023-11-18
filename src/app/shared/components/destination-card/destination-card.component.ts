import { Component, Input, OnInit } from '@angular/core';
import { Destination } from 'src/app/core/models/globetrotting/destination.interface';

@Component({
  selector: 'app-destination-card',
  templateUrl: './destination-card.component.html',
  styleUrls: ['./destination-card.component.scss'],
})
export class DestinationCardComponent implements OnInit {
  private _destination!: Destination;

  @Input() set destination(destination: Destination) {
    this._destination = destination;
  }

  get destination() {
    return this._destination;
  }

  constructor() { }

  ngOnInit() { }

}
