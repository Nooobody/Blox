import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pause',
  templateUrl: './pause.component.html',
  styleUrls: ['./pause.component.sass']
})
export class PauseComponent implements OnInit {

  @Output() unPauseEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() exitEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  private unPause() {
    this.unPauseEmitter.emit(true);
  }

  private exit() {
    this.exitEmitter.emit(true);
  }
}
