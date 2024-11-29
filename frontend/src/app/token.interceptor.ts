import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router'; // <-- Ensure the Router is imported
import { AuthService } from './auth.service'; // <-- Your AuthService
import { throwError } from 'rxjs';



@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private router: Router, private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('auth_token'); // Retrieve token from localStorage
    if (token) {
      // Clone the request and add the Authorization header
      request = request.clone({
        setHeaders: {
          Authorization: `Token ${token}`,
        },
      });
    }
    return next.handle(request).pipe(
      catchError((error) => {
        // If the error status is 401 (Unauthorized), handle the error (you could redirect here if needed)
        if (error.status === 401) {
          // Prevent automatic navigation here for 401 errors.
          // For example, we might want to logout the user and redirect to login, but avoid unnecessary redirects.
          console.error('Unauthorized error:', error);
          // Optional: You can redirect to login page if needed here.
          // this.router.navigate(['/login']);
        }
        // Throw the error so the caller can handle it further
        return throwError(error);
      })
    );
  }
}