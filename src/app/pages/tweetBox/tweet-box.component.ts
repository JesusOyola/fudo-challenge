import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { Post } from '../../interface/post';

@Component({
  selector: 'app-tweet-box',
  imports: [CommonModule, FormsModule],
  templateUrl: './tweet-box.component.html',
  styleUrl: './tweet-box.component.scss',
})
export class TweetBoxComponent {
  private postService = inject(PostService);

  name: string = '';
  content: string = '';
  imgurl: string = '';

  @Output() postCreated = new EventEmitter<Post>();

  handleSubmit(): void {
    if (!this.name.trim() || !this.content.trim()) {
      alert('Por favor, ingresa tu nombre y el contenido del post.');
      return;
    }

    const newPost: Partial<Post> = {
      name: this.name,
      content: this.content,
      avatar: this.imgurl,
      title: this.content.substring(0, 50) + '...',
      createdAt: new Date().toISOString(),
    };

    this.postService.createPost(newPost).subscribe({
      next: (createdPost: Post) => {
        console.log('Post creado exitosamente:', createdPost);
        this.name = '';
        this.content = '';
        this.imgurl = '';
        this.postCreated.emit(createdPost);
      },
      error: (error) => {
        console.error('Error al crear el post:', error);
        alert('Hubo un error al crear el post. Inténtalo de nuevo.');
      },
    });
  }
}
