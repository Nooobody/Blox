import { Component, OnInit, Input } from '@angular/core';
import { Position } from '../position.interface';

@Component({
  selector: 'platform',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.sass']
})
export class PlatformComponent implements OnInit {

  @Input() pos_x;
  private pos_y : number = 90;

  constructor() { }

  ngOnInit() {
  }



}
