import { CommonModule, Location } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post',
  imports: [CommonModule, RouterModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
})
export class PostComponent {
  private postService = inject(PostService);
  private location = inject(Location);

  @Input() id!: string;
  @Input() name!: string;
  @Input() content!: string;
  @Input() avatar?: string;
  @Input() createdAt?: string;
  @Input() title?: string;

  @Output() viewPostDetail = new EventEmitter<string>();
  @Output() postDeleted = new EventEmitter<string>();

  get locationPath(): string {
    return this.location.path() || '/posts';
  }

  onGetSingleTweet(): void {
    this.viewPostDetail.emit(this.id);
  }

  deleteTweet(): void {
    if (confirm('¿Estás seguro de que quieres eliminar este post?')) {
      this.postService.deletePost(this.id).subscribe({
        next: () => {
          console.log('Post eliminado:', this.id);
          this.postDeleted.emit(this.id);
        },
        error: (error) => {
          console.error('Error al eliminar el post:', error);
        },
      });
    }
  }
}
