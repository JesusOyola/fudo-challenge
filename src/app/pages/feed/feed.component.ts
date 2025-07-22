import { CommonModule, Location } from '@angular/common';
import { Component, OnInit,inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PostComponent } from '../post/post.component';
import { TweetBoxComponent } from '../tweetBox/tweet-box/tweet-box.component';


@Component({
  selector: 'app-feed',
  imports: [CommonModule, RouterModule,PostComponent,TweetBoxComponent,],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent implements OnInit {
  tweets: any[] = [];
  private location = inject(Location)

  constructor() {}

  get locationPath(): string {
    return this.location.path() || '/home'; 
  }

  ngOnInit(): void {
   
    this.getTweets();
  }

  getTweets(): void {
    this.tweets = [
    {
      tid: '1',
      name: 'Juan Pérez',
      content: 'Este es mi primer tweet con Angular 🚀',
      imgurl: 'https://i.pravatar.cc/150?img=1'
    },
    {
      tid: '2',
      name: 'Ana Gómez',
      content: '¡Me encanta programar en Angular! 💻',
      imgurl: 'https://i.pravatar.cc/150?img=2'
    },
    {
      tid: '3',
      name: 'Carlos López',
      content: 'Hoy aprendí a usar componentes dinámicos 👨‍💻',
      imgurl: 'https://i.pravatar.cc/150?img=3'
    },
    {
      tid: '4',
      name: 'Laura Rodríguez',
      content: '¿Alguien más emocionado por el nuevo release? 🔥',
      imgurl: 'https://i.pravatar.cc/150?img=4'
    }
  ];
  }
}
