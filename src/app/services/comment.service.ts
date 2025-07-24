import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
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
        // Si el error es un 404 (Not Found), significa que no hay comentarios.
        // En lugar de propagar el error, devolvemos un array vacío exitosamente.
        if (error.status === 404) {
          console.warn(`No comments found for post ${postId}. Returning empty array.`);
          return of([]); // Esto emite un array vacío como si fuera una respuesta exitosa
        }
        // Para cualquier otro tipo de error (red, servidor, etc.), lo propagamos
        console.error('Error fetching comments:', error);
        return throwError(() => new Error(`Failed to fetch comments for post ${postId}: ${error.message}`));
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
    commentId: string,
    comment: Partial<Comment>
  ): Observable<Comment> {
    return this.http.put<Comment>(
      `${this.baseUrl}/${postId}/comment/${commentId}`,
      comment
    );
  }
}
