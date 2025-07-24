import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PostComponent } from '../post/post.component';
import { TweetBoxComponent } from '../tweetBox/tweet-box.component';
import { PostService } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';
import { Post } from '../../interface/post';
import { Comment } from '../../interface/comment';
import { map, switchMap } from 'rxjs/operators';

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
    console.log('FeedComponent ngOnInit triggered.');
    this.activatedRoute.paramMap.subscribe((params) => {
      const postId = params.get('id');
      console.log('ngOnInit - route param postId:', postId);

      if (postId) {
        console.log(`Handling post detail for ID: ${postId}`);
        this.getSinglePost(postId);
      } else {
        console.log('Handling all posts (home/posts route)');
        this.getAllPosts();
      }
    });
  }

  getAllPosts(): void {
    console.log('Calling getAllPosts...');
    this.postService
      .getPosts()
      .pipe(map((posts: Post[]) => posts.reverse()))
      .subscribe({
        next: (retrievedPosts: Post[]) => {
          this.posts = retrievedPosts;
          this.currentPost = undefined;
          this.comments = [];
          console.log(
            'All posts (reverse order) loaded. Total:',
            this.posts.length
          );
        },
        error: (error) => {
          console.error('Error loading all posts:', error);
        },
      });
  }

  getSinglePost(id: string): void {
    console.log('Calling getSinglePost for ID:', id);
    this.postService
      .getSinglePost(id)
      .pipe(
        switchMap((singlePost: Post) => {
          console.log('PostService returned singlePost:', singlePost);
          this.currentPost = singlePost;
          this.posts = [singlePost];
          console.log('this.posts after update to singlePost:', this.posts);

          return this.commentService.getComments(id);
        })
      )
      .subscribe({
        next: (retrievedComments: Comment[]) => {
          this.comments = retrievedComments;
          console.log(
            `Comments loaded for post ${id}. Total:`,
            retrievedComments.length
          );
        },
        error: (error) => {
          console.error('Error loading the post or its comments:', error);

          this.currentPost = undefined;
          this.posts = [];
          this.comments = [];

          alert(
            'Hubo un error al cargar el post o sus comentarios. Por favor, inténtalo de nuevo más tarde o verifica la URL.'
          ); // Informar al usuario
        },
      });
  }

  onViewPostDetail(postId: string): void {
    console.log(`User clicked to view post detail ID: ${postId}`);
    this.router.navigate(['/posts', postId]);

    this.getSinglePost(postId);
  }

  onPostDeleted(deletedPostId: string): void {
    console.log('Post deleted event received:', deletedPostId);
    if (this.currentPost && this.currentPost.id === deletedPostId) {
      this.router.navigate(['/posts']);
      this.comments = [];
    } else {
      this.posts = this.posts.filter((post) => post.id !== deletedPostId);
    }
  }

  onPostUpdatedFromPostComponent(updatedPost: Post): void {
    console.log('Post updated event received:', updatedPost.id);
    this.posts = this.posts.map((p) =>
      p.id === updatedPost.id ? updatedPost : p
    );

    if (this.currentPost && this.currentPost.id === updatedPost.id) {
      this.currentPost = updatedPost;
    }
  }

  onPostCreated(newPost: Post): void {
    console.log('New post created:', newPost.id);
    this.posts.unshift(newPost);
  }

  onCommentCreated(newComment: Comment): void {
    console.log('New comment created:', newComment.id);
    this.comments.unshift(newComment);
  }

  backToHome() {
    console.log('Navigating back to home...');
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
      console.warn(
        `URL de avatar de comentario no válida: "${avatarUrl}". Usando imagen por defecto.`
      );
      return defaultAvatarUrl;
    }
  }

  deleteComment(commentId: string): void {
    console.log('Attempting to delete comment:', commentId);
    if (
      !this.currentPost ||
      !confirm('¿Estás seguro de que quieres eliminar este comentario?')
    ) {
      return;
    }

    this.commentService
      .deleteComment(this.currentPost.id, commentId)
      .subscribe({
        next: () => {
          this.comments = this.comments.filter(
            (comment) => comment.id !== commentId
          );
        },
        error: (error) => {
          console.error('Error deleting the comment:', error);
          alert('Hubo un error al eliminar el comentario. Inténtalo de nuevo.');
        },
      });
  }
}
