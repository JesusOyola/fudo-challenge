import { CommonModule, Location } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  OnInit,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post } from '../../interface/post';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
})
export class PostComponent implements OnInit {
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
  @Output() postUpdated = new EventEmitter<Post>();

  isEditing: boolean = false;
  editedContent: string = '';

  get locationPath(): string {
    return this.location.path() || '/posts';
  }

  ngOnInit(): void {
    this.editedContent = this.content;
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.editedContent = this.content;
    }
  }

  onSaveEdit(): void {
    if (!this.editedContent.trim()) {
      alert('El contenido del post no puede estar vacío.');
      return;
    }

    const updatedData: Partial<Post> = {
      title: this.editedContent.substring(0, 50) + '...',
      content: this.editedContent.trim(),
      createdAt: new Date().toISOString(),
    };

    this.postService.updatePost(this.id, updatedData).subscribe({
      next: (response) => {
        this.content = response.content;
        this.createdAt = response.createdAt;
        this.postUpdated.emit(response);
        this.isEditing = false;
        alert('Post actualizado.');
      },
      error: (error) => {
        console.error('Error al actualizar el post:', error);
        alert('Hubo un error al actualizar el post. Inténtalo de nuevo.');
      },
    });
  }

  onCancelEdit(): void {
    this.isEditing = false;
    this.editedContent = this.content;
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
