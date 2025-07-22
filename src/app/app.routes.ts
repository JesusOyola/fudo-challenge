import { Routes } from '@angular/router';
import { FeedComponent } from './pages/feed/feed.component';
import { PostComponent } from './pages/post/post.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: FeedComponent },
  { path: 'posts/:id', component: PostComponent },
  { path: '**', redirectTo: '/home' },
];
