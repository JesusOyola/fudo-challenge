import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class TweetBoxComponent implements OnInit, OnChanges {
  @Input() mode:
    | 'post'
    | 'comment'
    | 'editPost'
    | 'editComment'
    | 'replyComment' = 'post';
  @Input() parentId: string | null = null;
  @Input() postToEdit: Post | null = null;
  @Input() commentToEdit: Comment | null = null;
  @Input() replyToCommentId: string | null = null;

  @Output() postCreated = new EventEmitter<Post>();
  @Output() postUpdated = new EventEmitter<Post>();

  @Output() commentCreated = new EventEmitter<Comment>();

  @Output() commentUpdated = new EventEmitter<Comment>();

  @Output() cancelEdit = new EventEmitter<void>();

  name: string = 'Usuario Demo';
  avatar: string =
    'https://images-na.ssl-images-amazon.com/images/I/81-yKbVND-L.png';
  content: string = '';
  title: string = '';
  imgurl: string = '';

  constructor(
    private postService: PostService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.initializeContent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['commentToEdit'] || changes['postToEdit'] || changes['mode']) {
      this.initializeContent();
    }
  }

  private initializeContent(): void {
    if (this.mode === 'editPost' && this.postToEdit) {
      this.content = this.postToEdit.content;
      this.title = '';
      this.name = this.postToEdit.name;
      this.avatar = this.postToEdit.avatar;
    } else if (this.mode === 'editComment' && this.commentToEdit) {
      this.content = this.commentToEdit.content;
      this.name = this.commentToEdit.name;
      this.avatar = this.commentToEdit.avatar;
      this.title = '';
    } else {
      this.content = '';
      this.title = '';
      this.name = 'Usuario Demo';
      this.avatar =
        'https://images-na.ssl-images-amazon.com/images/I/81-yKbVND-L.png';
    }
  }

  handleAction(): void {
    if (!this.content.trim()) {
      alert('El contenido no puede estar vacío.');
      return;
    }

    if (
      !this.name.trim() &&
      (this.mode === 'post' ||
        this.mode === 'comment' ||
        this.mode === 'replyComment')
    ) {
      alert('Por favor, ingresa tu nombre.');
      return;
    }

    if (this.mode === 'post') {
      this.createPost();
    } else if (this.mode === 'comment' && this.parentId) {
      this.createComment();
    } else if (this.mode === 'replyComment' && this.parentId) {
      this.createComment();
    } else if (this.mode === 'editPost' && this.postToEdit) {
      this.updatePost();
    } else if (
      this.mode === 'editComment' &&
      this.commentToEdit &&
      this.parentId
    ) {
      this.updateComment();
    }
  }

  createPost(): void {
    const newPost: Partial<Post> = {
      name: this.name.trim(),
      avatar: this.avatar,
      content: this.content.trim(),
      title: '',
      createdAt: new Date().toISOString(),
    };
    this.postService.createPost(newPost).subscribe({
      next: (post) => {
        this.postCreated.emit(post);
        this.resetForm();
      },
      error: (error) => console.error('Error creating post:', error),
    });
  }

  updatePost(): void {
    if (this.postToEdit) {
      const updatedPost: Partial<Post> = {
        ...this.postToEdit,
        content: this.content.trim(),
        title: '',
        name: this.name,
        avatar: this.avatar,
      };

      this.postService.updatePost(this.postToEdit.id, updatedPost).subscribe({
        next: (post) => {
          console.log('Post updated successfully:', post);
          this.postUpdated.emit(post);
          this.resetForm();
        },
        error: (error) => console.error('Error updating post:', error),
      });
    }
  }

  createComment(): void {
    if (!this.parentId) {
      console.error(
        'Error: El modo comentario requiere un parentId (ID del post).'
      );
      alert('No se puede crear el comentario sin un post asociado.');
      return;
    }

    const newComment: Partial<Comment> = {
      content: this.content.trim(),
      name: this.name.trim(),
      avatar: this.avatar,
      createdAt: new Date().toISOString(),
      parentId: this.parentId,
    };

    this.commentService.createComment(this.parentId, newComment).subscribe({
      next: (comment) => {
        this.commentCreated.emit(comment);
        this.resetForm();
      },
      error: (error) => console.error('Error creating comment:', error),
    });
  }

  updateComment(): void {
    if (this.parentId && this.commentToEdit) {
      const updatedCommentData: Partial<Comment> = {
        content: this.content.trim(),
        name: this.name,
        avatar: this.avatar,
      };
      this.commentUpdated.emit(updatedCommentData as Comment);
      this.resetForm();
    }
  }

  resetForm(): void {
    this.content = '';
    this.title = '';
    this.imgurl = '';
    this.name = 'Usuario Demo';
    this.avatar =
      'https://images-na.ssl-images-amazon.com/images/I/81-yKbVND-L.png';
  }

  onCancel(): void {
    this.cancelEdit.emit();
  }
}
