import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PostService } from './post.service';
import { Post } from '../interface/post';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';

describe('PostService', () => {
  let service: PostService;
  let httpTestingController: HttpTestingController;
  const apiUrl = 'https://665de6d7e88051d60408c32d.mockapi.io/post';

  
  const mockPosts: Post[] = [
    { id: '1', title: 'Post 1', content: 'Content 1', createdAt: '2023-01-01T10:00:00Z', avatar: 'avatar1.png', name: 'User A' },
    { id: '2', title: 'Post 2', content: 'Content 2', createdAt: '2023-01-02T11:00:00Z', avatar: 'avatar2.png', name: 'User B' },
  ];
  const mockPost: Post = { id: '3', title: 'Single Post', content: 'Single Post Content', createdAt: '2023-01-03T12:00:00Z', avatar: 'avatar3.png', name: 'User C' };


  beforeEach(() => {
    TestBed.configureTestingModule({ 
      providers: [PostService,provideHttpClient(),       
        provideHttpClientTesting() ],
    });
    service = TestBed.inject(PostService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  describe('getPosts', () => {
    it('should retrieve all posts', () => {
      service.getPosts().subscribe((posts) => {
        expect(posts).toEqual(mockPosts);
        expect(posts.length).toBe(2);
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPosts); 
    });

    it('should handle error when retrieving posts', (done) => {
      const mockErrorStatus = 500;
      const mockErrorStatusText = 'Server Error';
      const mockErrorMessage = 'Failed to fetch posts';

      service.getPosts().subscribe({
        next: () => fail('should have failed with the error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(mockErrorStatus);
          expect(error.statusText).toBe(mockErrorStatusText);
          expect(error.error).toBe(mockErrorMessage);
          expect(error.message).toContain(`Http failure response for ${apiUrl}: ${mockErrorStatus} ${mockErrorStatusText}`);
          done();
        },
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockErrorMessage, { status: mockErrorStatus, statusText: mockErrorStatusText });
    });
  });

  
  describe('getSinglePost', () => {
    const postId = 'post1';
    const expectedUrl = `${apiUrl}/${postId}`;

    it('should retrieve a single post by ID', () => {
      service.getSinglePost(postId).subscribe((post) => {
        expect(post).toEqual(mockPost);
      });

      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPost); 
    });

    it('should handle error when retrieving a single post', (done) => {
      const mockErrorStatus = 404;
      const mockErrorStatusText = 'Not Found';
      const mockErrorMessage = 'Post not found';

      service.getSinglePost(postId).subscribe({
        next: () => fail('should have failed with the error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(mockErrorStatus);
          expect(error.statusText).toBe(mockErrorStatusText);
          expect(error.error).toBe(mockErrorMessage);
          expect(error.message).toContain(`Http failure response for ${expectedUrl}: ${mockErrorStatus} ${mockErrorStatusText}`);
          done();
        },
      });

      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockErrorMessage, { status: mockErrorStatus, statusText: mockErrorStatusText });
    });
  });

  
  describe('createPost', () => {
    const newPost: Partial<Post> = { title: 'New Post', content: 'New content', name: 'New User', avatar: 'new.png' };
    const createdPost: Post = { ...newPost, id: '3', createdAt: new Date().toISOString() } as Post;

    it('should create a new post', () => {
      service.createPost(newPost).subscribe((post) => {
        expect(post).toEqual(createdPost);
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPost); 
      req.flush(createdPost); 
    });

    it('should handle error when creating a post', (done) => {
      const mockErrorStatus = 400;
      const mockErrorStatusText = 'Bad Request';
      const mockErrorMessage = 'Invalid post data';

      service.createPost(newPost).subscribe({
        next: () => fail('should have failed with the error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(mockErrorStatus);
          expect(error.statusText).toBe(mockErrorStatusText);
          expect(error.error).toBe(mockErrorMessage);
          done();
        },
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(mockErrorMessage, { status: mockErrorStatus, statusText: mockErrorStatusText });
    });
  });

  
  describe('deletePost', () => {
    const postId = 'post1';
    const expectedUrl = `${apiUrl}/${postId}`;
    const deletedPostResponse: Post = { id: postId, title: 'Deleted', content: 'Deleted', createdAt: '', avatar: '', name: '' }; // Mock de lo que la API podría devolver al eliminar

    it('should delete a post by ID', () => {
      service.deletePost(postId).subscribe((response) => {
        expect(response).toEqual(deletedPostResponse);
      });

      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');
      req.flush(deletedPostResponse); 
    });

    it('should handle error when deleting a post', (done) => {
      const mockErrorStatus = 404;
      const mockErrorStatusText = 'Not Found';
      const mockErrorMessage = 'Post to delete not found';

      service.deletePost(postId).subscribe({
        next: () => fail('should have failed with the error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(mockErrorStatus);
          expect(error.statusText).toBe(mockErrorStatusText);
          expect(error.error).toBe(mockErrorMessage);
          done();
        },
      });

      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockErrorMessage, { status: mockErrorStatus, statusText: mockErrorStatusText });
    });
  });

  
  describe('updatePost', () => {
    const postId = 'post1';
    const updatedPostData: Partial<Post> = { title: 'Updated Title', content: 'Updated content' };
    const expectedUrl = `${apiUrl}/${postId}`;
    const returnedUpdatedPost: Post = { ...mockPost, ...updatedPostData, id: postId }; 

    it('should update an existing post', () => {
      service.updatePost(postId, updatedPostData).subscribe((post) => {
        expect(post).toEqual(returnedUpdatedPost);
      });

      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedPostData); 
      req.flush(returnedUpdatedPost); 
    });

    it('should handle error when updating a post', (done) => {
      const mockErrorStatus = 400;
      const mockErrorStatusText = 'Bad Request';
      const mockErrorMessage = 'Invalid update data';

      service.updatePost(postId, updatedPostData).subscribe({
        next: () => fail('should have failed with the error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(mockErrorStatus);
          expect(error.statusText).toBe(mockErrorStatusText);
          expect(error.error).toBe(mockErrorMessage);
          done();
        },
      });

      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toBe('PUT');
      req.flush(mockErrorMessage, { status: mockErrorStatus, statusText: mockErrorStatusText });
    });
  });
});