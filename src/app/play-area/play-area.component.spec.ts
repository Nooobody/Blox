import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayAreaComponent } from './play-area.component';
import { BallComponent } from '../ball/ball.component';
import { BlockComponent } from '../block/block.component';
import { PlatformComponent } from '../platform/platform.component';
import { MainMenuComponent } from '../main-menu/main-menu.component';
import { PauseComponent } from '../pause/pause.component';

describe('PlayAreaComponent', () => {
  let component: PlayAreaComponent;
  let fixture: ComponentFixture<PlayAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayAreaComponent,
        BallComponent,
        BlockComponent,
        PlatformComponent,
        MainMenuComponent,
        PauseComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
