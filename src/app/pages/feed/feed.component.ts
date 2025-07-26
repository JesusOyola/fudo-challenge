import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core'; 
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TweetBoxComponent } from '../tweetBox/tweet-box.component';
import { PostService } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';
import { Post } from '../../interface/post';
import { Comment } from '../../interface/comment';
import { map, switchMap, takeUntil } from 'rxjs/operators'; 
import { Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PostComponent } from '../post/post.component';

@Component({
  selector: 'app-feed',
  imports: [
    CommonModule,
    RouterModule,
    PostComponent,
    TweetBoxComponent,
    FormsModule,
  ],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss',
})
export class FeedComponent implements OnInit, OnDestroy { 
  private postService = inject(PostService);
  private commentService = inject(CommentService);
  private location = inject(Location);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  posts: Post[] = [];
  currentPost: Post | undefined;
  comments: Comment[] = [];

  editingCommentId: string | null = null;
  editedCommentContent: string = '';
  commentBeingEdited: Comment | null = null;

  replyingToCommentId: string | null = null;

  
  private destroy$ = new Subject<void>(); 

  get locationPath(): string {
    return this.location.path() || '/home';
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap
      .pipe(takeUntil(this.destroy$)) 
      .subscribe((params) => {
        const postId = params.get('id');

        if (postId) {
          console.log('pepe');
          this.getSinglePost(postId);
        } else {
          console.log('pepe2');
          this.getAllPosts();
        }
      });
  }

  
  ngOnDestroy(): void {
    this.destroy$.next();    
    this.destroy$.complete(); 
  }

  getAllPosts(): void {
    this.postService
      .getPosts()
      .pipe(
        map((posts: Post[]) => posts.reverse()),
        takeUntil(this.destroy$) 
      )
      .subscribe({
        next: (retrievedPosts: Post[]) => {
          this.posts = retrievedPosts;
          this.currentPost = undefined;
          this.comments = [];
        },
        error: (error) => {
          console.error('Error loading all posts:', error);
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
          return this.commentService.getComments(id);
        }),
        takeUntil(this.destroy$) 
      )
      .subscribe({
        next: (retrievedComments: Comment[]) => {
          this.comments = retrievedComments;
        },
        error: (error) => {
          this.currentPost = undefined;
          this.posts = [];
          this.comments = [];
          alert(
            'Hubo un error al cargar el post o sus comentarios. Por favor, inténtalo de nuevo más tarde o verifica la URL.'
          );
        },
      });
  }

  onViewPostDetail(postId: string): void {
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
    }
  }

  saveEditedComment(updatedComment: Comment): void {
    if (!this.currentPost) {
      return;
    }

    if (
      this.commentBeingEdited &&
      updatedComment.id !== this.commentBeingEdited.id
    ) {
      this.comments = this.comments.filter(
        (c) => c.id !== this.commentBeingEdited!.id
      );
      this.comments.unshift(updatedComment);
    } else {
      this.comments = this.comments.map((c) =>
        c.id === updatedComment.id ? updatedComment : c
      );
    }
    this.cancelEditComment();
  }

  onPostCreated(newPost: Post): void {
    this.posts.unshift(newPost);
  }

  onCommentCreated(newComment: Comment): void {
    this.comments.unshift(newComment);
    if (this.replyingToCommentId) {
      this.cancelReplyComment();
    }
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
    if (
      !this.currentPost ||
      !confirm('¿Estás seguro de que quieres eliminar este comentario?')
    ) {
      return;
    }

    this.commentService
      .deleteComment(this.currentPost.id, commentId)
      .pipe(takeUntil(this.destroy$)) 
      .subscribe({
        next: () => {
          this.comments = this.comments.filter(
            (comment) => comment.id !== commentId
          );
          if (this.editingCommentId === commentId) {
            this.cancelEditComment();
          }
          if (this.replyingToCommentId === commentId) {
            this.cancelReplyComment();
          }
        },
        error: (error) => {
          alert('Hubo un error al eliminar el comentario. Inténtalo de nuevo.');
        },
      });
  }

  editComment(comment: Comment): void {
    this.cancelReplyComment();
    this.editingCommentId = comment.id;
    this.commentBeingEdited = { ...comment };
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editedCommentContent = '';
    this.commentBeingEdited = null;
  }

  toggleReplyComment(commentId: string): void {
    if (this.replyingToCommentId === commentId) {
      this.cancelReplyComment();
    } else {
      this.cancelEditComment();
      this.replyingToCommentId = commentId;
    }
  }

  cancelReplyComment(): void {
    this.replyingToCommentId = null;
  }
}