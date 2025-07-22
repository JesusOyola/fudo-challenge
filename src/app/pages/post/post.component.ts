import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-post',
  imports: [CommonModule,RouterModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent {
  private router = inject(Router)
  @Input() id!: string;
  @Input() name!: string;
  @Input() content!: string;
  @Input() imgurl?: string;

  getUserTweets(): void {
    this.router.navigate([`/users/${this.name}`]);
  }

  getSingleTweet(): void {
    this.router.navigate([`/tweets/${this.id}`]);
  }

  deleteTweet(): void {
    // Aquí debe ir la lógica para borrar el tweet
    console.log('Tweet borrado:', this.id);
  }

}
