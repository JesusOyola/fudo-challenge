import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { Post } from '../../interface/post';
import { CommentService } from '../../services/comment.service';
import { Comment } from '../../interface/comment';

@Component({
  selector: 'app-tweet-box',
  imports: [CommonModule, FormsModule],
  templateUrl: './tweet-box.component.html',
  styleUrl: './tweet-box.component.scss',
})
export class TweetBoxComponent {
  private postService = inject(PostService);
  private commentService = inject(CommentService);

  @Input() mode: 'post' | 'comment' = 'post';
  @Input() parentId: string | null = null;

  name: string = '';
  content: string = '';
  imgurl: string = '';

  @Output() postCreated = new EventEmitter<Post>();
  @Output() commentCreated = new EventEmitter<Comment>();

  handleSubmit(): void {
    if (!this.content.trim()) {
      alert('El contenido no puede estar vacío.');
      return;
    }

    if (this.mode === 'post') {
      if (!this.name.trim()) {
        alert('Por favor, ingresa tu nombre para el post.');
        return;
      }

      const newPost: Partial<Post> = {
        name: this.name.trim(),
        content: this.content.trim(),
        avatar:
          this.imgurl.trim() ||
          'https://images-na.ssl-images-amazon.com/images/I/81-yKbVND-L.png',
        title: this.content.trim().substring(0, 50) + '...',
        createdAt: new Date().toISOString(),
      };

      this.postService.createPost(newPost).subscribe({
        next: (createdPost: Post) => {
          console.log('Post creado exitosamente:', createdPost);
          this.resetForm();
          this.postCreated.emit(createdPost);
        },
        error: (error) => {
          console.error('Error al crear el post:', error);
          alert('Hubo un error al crear el post. Inténtalo de nuevo.');
        },
      });
    } else if (this.mode === 'comment') {
      if (!this.parentId) {
        console.error('Error: El modo comentario requiere un parentId.');
        alert('No se puede crear el comentario sin un post asociado.');
        return;
      }

      const newComment: Partial<Comment> = {
        content: this.content.trim(),
        name: this.name.trim() || 'Anónimo',
        avatar:
          this.imgurl.trim() ||
          'https://images-na.ssl-images-amazon.com/images/I/81-yKbVND-L.png',
        createdAt: new Date().toISOString(),
        parentId: null,
      };

      this.commentService.createComment(this.parentId, newComment).subscribe({
        next: (createdComment: Comment) => {
          console.log('Comentario creado exitosamente:', createdComment);
          this.resetForm();
          this.commentCreated.emit(createdComment);
        },
        error: (error) => {
          console.error('Error al crear el comentario:', error);
        },
      });
    }
  }

  private resetForm(): void {
    this.name = '';
    this.content = '';
    this.imgurl = '';
  }
}
