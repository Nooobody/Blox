import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Position } from '../position.interface';

@Component({
  selector: 'platform',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.sass']
})
export class PlatformComponent implements OnInit {

  @Input() pos_x;
  @Input() size;
  private pos_y : number = 88;
  private moving_left : boolean = false;
  private moving_right : boolean = false;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes) {
    let currentV = changes.pos_x.previousValue;
    let newV = changes.pos_x.currentValue;
    if (newV > currentV) {
      this.moving_left = false;
      this.moving_right = true;
    }
    else {
      this.moving_right = false;
      this.moving_left = true;
    }
    this.setTimer(newV);
  }

  private setTimer(current) {
    let timer = Observable.timer(100);
    timer.subscribe(t => {
      if (this.pos_x === current) {
        this.moving_left = false;
        this.moving_right = false;
      }
    });
  }

}
