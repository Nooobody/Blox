import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { PlayAreaComponent } from './play-area/play-area.component';
import { BlockComponent } from './block/block.component';
import { PlatformComponent } from './platform/platform.component';
import { BallComponent } from './ball/ball.component';
import { PauseComponent } from './pause/pause.component';
import { MainMenuComponent } from './main-menu/main-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    PlayAreaComponent,
    BlockComponent,
    PlatformComponent,
    BallComponent,
    PauseComponent,
    MainMenuComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
