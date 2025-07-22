import { Component } from '@angular/core';
import { SidebarComponent } from './pages/sidebar/sidebar.component';
import { FeedComponent } from './pages/feed/feed.component';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent,FeedComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fudo-challenge-app';
}
