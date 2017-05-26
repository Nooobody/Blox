import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.sass']
})
export class MainMenuComponent implements OnInit {

  @Output("levelSelected") levelEmitter = new EventEmitter<string>();
  @Input("firstTime") firstTime;

  private level_data = [
    "level1",
    "level2",
    "level3",
    "level4",
    "level5",
    "level6",
    "level7",
    "level8",
    "level9",
    "level10",
    "level11",
    "level12",
    "level13",
    "level14",
    "level15",
    "level16",
    "level17",
    "level18",
    "level19",
    "level20"
  ]

  private available = [
    "level1",
    "level2",
    "level3",
    "level4",
    "level5"
  ]

  private level_selection: boolean = false;

  constructor() { }

  ngOnInit() {
    if (this.firstTime) {
      this.level_selection = true;
    }
  }

  private play() {
    this.level_selection = true;
  }

  private setLevel(level) {
    if (this.available.find((value) => level === value)) {
      this.levelEmitter.emit(level);
    }
  }
}
