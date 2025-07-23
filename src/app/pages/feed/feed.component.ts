import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PostComponent } from '../post/post.component';
import { TweetBoxComponent } from '../tweetBox/tweet-box.component';
import { PostService } from '../../services/post.service';
import { Post } from '../../interface/post';
import { map, switchMap } from 'rxjs/operators';
import { CommentService } from '../../services/comment.service';
import { Comment } from '../../interface/comment';

@Component({
  selector: 'app-feed',
  imports: [CommonModule, RouterModule, PostComponent, TweetBoxComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss',
})
export class FeedComponent implements OnInit {
  private postService = inject(PostService);
  private commentService = inject(CommentService);
  private location = inject(Location);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  posts: Post[] = [];
  currentPost: Post | undefined;
  comments: Comment[] = [];

  get locationPath(): string {
    return this.location.path() || '/home';
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const postId = params.get('id');

      if (postId) {
        console.log(postId);
        this.getSinglePost(postId);
      } else {
        this.getAllPosts();
      }
    });
  }

  getAllPosts(): void {
    this.postService
      .getPosts()
      .pipe(map((posts: Post[]) => posts.reverse()))
      .subscribe({
        next: (retrievedPosts: Post[]) => {
          this.posts = retrievedPosts;
          this.currentPost = undefined;
          this.comments = [];
          console.log('Todos los posts (orden inverso):', retrievedPosts);
        },
        error: (error) => {
          console.error('Error al cargar todos los posts:', error);
        },
      });
  }

  getSinglePost(id: string): void {
    this.postService
      .getSinglePost(id)
      .pipe(
        switchMap((singlePost: Post) => {
          this.currentPost = singlePost;
          this.posts = [singlePost];
          console.log('Post individual cargado:', singlePost);

          return this.commentService.getComments(id);
        })
      )
      .subscribe({
        next: (retrievedComments: Comment[]) => {
          this.comments = retrievedComments;
          console.log(
            `Comentarios cargados para post ${id}:`,
            retrievedComments
          );
        },
        error: (error) => {
          console.error('Error al cargar el post o sus comentarios:', error);
          //this.router.navigate(['/posts']);
          this.comments = [];
        },
      });
  }

  onViewPostDetail(postId: string): void {
    console.log(postId);
    this.router.navigate(['/posts', postId]);
    this.getSinglePost(postId);
  }

  onPostDeleted(deletedPostId: string): void {
    if (this.currentPost && this.currentPost.id === deletedPostId) {
      this.router.navigate(['/posts']);
      this.comments = [];
    } else {
      this.posts = this.posts.filter((post) => post.id !== deletedPostId);
    }
  }

  onPostUpdatedFromPostComponent(updatedPost: Post): void {
    this.posts = this.posts.map((p) =>
      p.id === updatedPost.id ? updatedPost : p
    );

    if (this.currentPost && this.currentPost.id === updatedPost.id) {
      this.currentPost = updatedPost;
      this.backToHome();
    }
    console.log('Post actualizado recibido desde PostComponent:', updatedPost);
  }

  onPostCreated(newPost: Post): void {
    this.posts.unshift(newPost);
  }

  backToHome() {
    this.router.navigate(['/home']);
    this.getAllPosts();
  }

  getCommentAvatarSrc(avatarUrl: string): string {
    const defaultAvatarUrl =
      'https://images-na.ssl-images-amazon.com/images/I/81-yKbVND-L.png';

    if (!avatarUrl) {
      return defaultAvatarUrl;
    }

    const imageUrlPattern =
      /^(https?:\/\/[^\s/$.?#].[^\s]*)\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i;

    if (imageUrlPattern.test(avatarUrl)) {
      return avatarUrl;
    } else {
      return defaultAvatarUrl;
    }
  }

  deleteComment(commentId: string): void {
    if (!this.currentPost || !confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    this.commentService.deleteComment(this.currentPost.id, commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(comment => comment.id !== commentId);
        console.log(`Comentario ${commentId} eliminado.`);
      },
      error: (error) => {
        console.error('Error al eliminar el comentario:', error);
        alert('Hubo un error al eliminar el comentario. Inténtalo de nuevo.');
      },
    });
  }
}
