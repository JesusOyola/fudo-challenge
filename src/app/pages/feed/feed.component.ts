import { CommonModule, Location } from '@angular/common';

import { Component, OnInit, inject } from '@angular/core';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PostComponent } from '../post/post.component';

import { TweetBoxComponent } from '../tweetBox/tweet-box.component';

import { PostService } from '../../services/post.service';

import { Post } from '../../interface/post';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-feed',

  imports: [CommonModule, RouterModule, PostComponent, TweetBoxComponent],

  templateUrl: './feed.component.html',

  styleUrl: './feed.component.scss',
})
export class FeedComponent implements OnInit {
  private postService = inject(PostService);

  private location = inject(Location);

  private router = inject(Router);

  private activatedRoute = inject(ActivatedRoute);

  posts: Post[] = [];

  currentPost: Post | undefined;

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
          console.log('Todos los posts (orden inverso):', retrievedPosts);
        },
        error: (error) => {
          console.error('Error al cargar todos los posts:', error);
        },
      });
  }

  getSinglePost(id: string): void {
    this.postService.getSinglePost(id).subscribe({
      next: (singlePost: Post) => {
        this.currentPost = singlePost;
        this.posts = [singlePost];
        console.log('Post individual:', singlePost);
      },

      error: (error) => {
        console.error('Error al cargar el post individual:', error);

        this.router.navigate(['/posts']);
      },
    });
  }

  onViewPostDetail(postId: string): void {
    console.log(postId);

    this.router.navigate(['/posts', postId]);

    this.getSinglePost(postId);
  }

  onPostDeleted(deletedPostId: string): void {
    if (!this.currentPost) {
      this.posts = this.posts.filter((post) => post.id !== deletedPostId);
    } else if (this.currentPost.id === deletedPostId) {
      this.router.navigate(['/posts']);
    }
  }

  onPostCreated(newPost: Post): void {
    this.posts.unshift(newPost);
  }

  backToHome() {
    this.router.navigate(['/home']);
    this.getAllPosts();
  }
}
