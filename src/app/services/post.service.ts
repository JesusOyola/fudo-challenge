import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../interface/post';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);
  private apiUrl = 'https://665de6d7e88051d60408c32d.mockapi.io/post';

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  getSinglePost(postId: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${postId}`);
  }

  createPost(post: Partial<Post>): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, post);
  }

  deletePost(postId: string): Observable<Post> {
    return this.http.delete<Post>(`${this.apiUrl}/${postId}`);
  }

  updatePost(postId: string, post: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${postId}`, post);
  }
}
