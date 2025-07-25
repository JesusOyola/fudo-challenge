import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, concatMap, Observable, of, throwError } from 'rxjs';
import { Comment } from '../interface/comment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private http = inject(HttpClient);
  private baseUrl = 'https://665de6d7e88051d60408c32d.mockapi.io';

  getComments(postId: string): Observable<Comment[]> {
    const url = `${this.baseUrl}/post/${postId}/comment`;
    console.log(`Fetching comments from: ${url}`);
    return this.http.get<Comment[]>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.warn(
            `No comments found for post ${postId}. Returning empty array.`
          );
          return of([]);
        }

        console.error('Error fetching comments:', error);
        return throwError(() => error);
      })
    );
  }

  createComment(
    postId: string,
    comment: Partial<Comment>
  ): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.baseUrl}/post/${postId}/comment`,
      comment
    );
  }

  deleteComment(postId: string, commentId: string): Observable<Comment> {
    return this.http.delete<Comment>(
      `${this.baseUrl}/post/${postId}/comment/${commentId}`
    );
  }

  updateComment(
    postId: string,
    originalComment: Comment,
    updatedContent: string
  ): Observable<Comment> {
    return this.deleteComment(postId, originalComment.id).pipe(
      concatMap(() => {
        const newCommentData: Partial<Comment> = {
          name: originalComment.name,
          avatar: originalComment.avatar,
          parentId: originalComment.parentId,
          content: updatedContent.trim(),
          createdAt: new Date().toISOString(),
        };
        console.log("Creating 'edited' comment:", newCommentData);
        return this.createComment(postId, newCommentData);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(
          `Error in simulated update for comment ${originalComment.id}:`,
          error
        );
        return throwError(
          () =>
            new Error(`Failed to simulate update for comment: ${error.message}`)
        );
      })
    );
  }
}
