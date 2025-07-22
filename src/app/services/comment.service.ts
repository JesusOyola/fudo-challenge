import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment } from '../interface/comment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private http = inject(HttpClient);
  private baseUrl = 'https://665de6d7e88051d60408c32d.mockapi.io/post';

  getComments(postId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/${postId}/comment`);
  }

  createComment(
    postId: string,
    comment: Partial<Comment>
  ): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.baseUrl}/${postId}/comment`,
      comment
    );
  }

  deleteComment(postId: string, commentId: string): Observable<Comment> {
    return this.http.delete<Comment>(
      `${this.baseUrl}/${postId}/comment/${commentId}`
    );
  }

  updateComment(
    postId: string,
    commentId: string,
    comment: Partial<Comment>
  ): Observable<Comment> {
    return this.http.put<Comment>(
      `${this.baseUrl}/${postId}/comment/${commentId}`,
      comment
    );
  }
}
