import { TestBed } from '@angular/core/testing';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CommentService } from './comment.service';
import { Comment } from '../interface/comment';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';

describe('CommentService', () => {
  let service: CommentService;
  let httpTestingController: HttpTestingController;
  const baseUrl = 'https://665de6d7e88051d60408c32d.mockapi.io';

  const mockComments: Comment[] = [
    {
      id: '1',
      content: 'Comment 1',
      name: 'User1',
      avatar: '',
      createdAt: '2023-01-01T10:00:00Z',
      parentId: 'post1',
    },
    {
      id: '2',
      content: 'Comment 2',
      name: 'User2',
      avatar: '',
      createdAt: '2023-01-02T10:00:00Z',
      parentId: 'post1',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommentService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CommentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getComments', () => {
    const postId = 'post123';
    const expectedUrl = `${baseUrl}/post/${postId}/comment`;

    it('should return comments for a given postId', () => {
      service.getComments(postId).subscribe((comments) => {
        expect(comments).toEqual(mockComments);
      });

      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockComments);
    });

    it('should return an empty array if 404 error occurs', () => {
      service.getComments(postId).subscribe((comments) => {
        expect(comments).toEqual([]);
      });

      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush([], { status: 404, statusText: 'Not Found' });
    });

    it('should return an error for other HttpErrorResponse statuses', (done) => {
      const mockErrorStatus = 500;
      const mockErrorStatusText = 'Server Error';
      const mockErrorMessage = 'test 500 error';

      service.getComments(postId).subscribe({
        next: () => fail('should have failed with an error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(mockErrorStatus);
          expect(error.statusText).toBe(mockErrorStatusText);
          expect(error.error).toBe(mockErrorMessage);

          expect(error.message).toContain(
            `Http failure response for ${expectedUrl}: ${mockErrorStatus} ${mockErrorStatusText}`
          );
          done();
        },
      });

      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');

      req.flush(mockErrorMessage, {
        status: mockErrorStatus,
        statusText: mockErrorStatusText,
      });
    });
  });

  describe('createComment', () => {
    const postId = 'post123';
    const newComment: Partial<Comment> = {
      content: 'New test comment',
      name: 'TestUser',
      avatar: 'test-avatar.png',
      parentId: postId,
    };
    const expectedComment: Comment = {
      ...newComment,
      id: 'newId',
      createdAt: '2023-07-25T12:00:00Z',
    } as Comment;
    const expectedUrl = `${baseUrl}/post/${postId}/comment`;

    it('should create a new comment', () => {
      service.createComment(postId, newComment).subscribe((comment) => {
        expect(comment).toEqual(expectedComment);
      });

      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newComment);
      req.flush(expectedComment);
    });

    it('should handle error when creating a comment', (done) => {
      const errorResponse = new HttpErrorResponse({
        error: 'Failed to create comment',
        status: 400,
        statusText: 'Bad Request',
      });

      service.createComment(postId, newComment).subscribe({
        next: () => fail('should have failed with the 400 error'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });

      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      req.error(
        new ErrorEvent('Network error', { message: '400 Bad Request' }),
        errorResponse
      );
    });
  });

  describe('deleteComment', () => {
    const postId = 'post123';
    const commentId = 'comment456';
    const expectedUrl = `${baseUrl}/post/${postId}/comment/${commentId}`;

    it('should delete a comment', () => {
      service.deleteComment(postId, commentId).subscribe((comment) => {
        expect(comment).toEqual({ id: commentId } as Comment);
      });

      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');
      req.flush({ id: commentId });
    });

    it('should handle error when deleting a comment', (done) => {
      const errorResponse = new HttpErrorResponse({
        error: 'Failed to delete comment',
        status: 404,
        statusText: 'Not Found',
      });

      service.deleteComment(postId, commentId).subscribe({
        next: () => fail('should have failed with the 404 error'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });

      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');
      req.error(
        new ErrorEvent('Network error', { message: '404 Not Found' }),
        errorResponse
      );
    });
  });

  describe('updateComment', () => {
    const postId = 'post123';
    const originalComment: Comment = {
      id: 'comment456',
      content: 'Original content',
      name: 'OriginalUser',
      avatar: 'original.png',
      createdAt: '2023-01-01T10:00:00Z',
      parentId: postId,
    };
    const updatedContent = 'Updated content';
    const expectedDeleteUrl = `${baseUrl}/post/${postId}/comment/${originalComment.id}`;
    const expectedCreateUrl = `${baseUrl}/post/${postId}/comment`;

    it('should delete the original comment and create a new one with updated content', (done) => {
      const exampleCreatedAt = new Date().toISOString();
      const newCommentData: Partial<Comment> = {
        name: originalComment.name,
        avatar: originalComment.avatar,
        parentId: originalComment.parentId,
        content: updatedContent,
        createdAt: exampleCreatedAt,
      };
      const createdComment: Comment = {
        ...newCommentData,
        id: 'newUpdatedId',
        createdAt: '2023-07-25T15:00:00Z',
      } as Comment;

      service
        .updateComment(postId, originalComment, updatedContent)
        .subscribe((comment) => {
          expect(comment.id).toBe('newUpdatedId');
          expect(comment.content).toBe(updatedContent);
          expect(comment.parentId).toBe(originalComment.parentId);
          done();
        });

      const deleteReq = httpTestingController.expectOne(expectedDeleteUrl);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({ id: originalComment.id });

      const createReq = httpTestingController.expectOne(expectedCreateUrl);
      expect(createReq.request.method).toBe('POST');

      expect(createReq.request.body.content).toBe(updatedContent);
      expect(createReq.request.body.parentId).toBe(originalComment.parentId);
      expect(createReq.request.body.name).toBe(originalComment.name);
      expect(createReq.request.body.avatar).toBe(originalComment.avatar);

      expect(createReq.request.body.createdAt).toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
      );

      createReq.flush(createdComment);
    });

    it('should handle error if delete fails during update', (done) => {
      const deleteErrorResponse = new HttpErrorResponse({
        error: 'Failed to delete comment during update',
        status: 500,
        statusText: 'Server Error',
      });

      service.updateComment(postId, originalComment, updatedContent).subscribe({
        next: () => fail('should have failed with delete error'),
        error: (error) => {
          expect(error.message).toContain(
            'Failed to simulate update for comment'
          );
          done();
        },
      });

      const deleteReq = httpTestingController.expectOne(expectedDeleteUrl);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.error(new ErrorEvent('Network error'), deleteErrorResponse);
    });

    it('should handle error if create fails during update after successful delete', (done) => {
      const createErrorResponse = new HttpErrorResponse({
        error: 'Failed to create new comment after delete',
        status: 400,
        statusText: 'Bad Request',
      });

      service.updateComment(postId, originalComment, updatedContent).subscribe({
        next: () => fail('should have failed with create error'),
        error: (error) => {
          expect(error.message).toContain(
            'Failed to simulate update for comment'
          );
          done();
        },
      });

      const deleteReq = httpTestingController.expectOne(expectedDeleteUrl);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({ id: originalComment.id });

      const createReq = httpTestingController.expectOne(expectedCreateUrl);
      expect(createReq.request.method).toBe('POST');
      createReq.error(new ErrorEvent('Network error'), createErrorResponse);
    });
  });
});
