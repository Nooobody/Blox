import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Position } from '../position.interface';

@Component({
  selector: 'ball',
  templateUrl: './ball.component.html',
  styleUrls: ['./ball.component.sass']
})
export class BallComponent implements OnInit {
  @Input() position : Position;

  private trails = [];

  constructor() { }

  ngOnInit() {
    let timer = Observable.timer(0, 100);
    timer.subscribe(t => {

      this.trails.forEach((part, index, arr) => {
        arr[index].size -= 4;
      });

      let pos = JSON.parse(JSON.stringify({x: this.position.x, y: this.position.y}));
      this.trails.push({
        position: pos,
        size: 40
      });

      if (this.trails.length > 7) {
        this.trails.shift();
      }
    });
  }
}
