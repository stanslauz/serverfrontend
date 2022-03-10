  import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Status } from '../enum/status.enum';
import { CustomResponse } from '../interface/custom-response';
import { Server } from '../interface/server';
import { Users } from '../interface/users';

@Injectable({ providedIn: 'root' })
export class ServerService {
  private readonly apiUrl = 'http://localhost:8089';

  constructor(private http: HttpClient ) { }
  //todo server should ping first onload
  servers$ = <Observable<CustomResponse>>

    this.http.get<CustomResponse>(`${this.apiUrl}/server/list`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

      serversWithUser$ = (id : any) => <Observable<CustomResponse>>

      this.http.get<CustomResponse>(`${this.apiUrl}/server/list/${id}`)
        .pipe(
          tap(console.log),
          catchError(this.handleError)
        );

  users$ = <Observable<CustomResponse>>

    this.http.get<CustomResponse>(`${this.apiUrl}/server/listUsers`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );
  save$ = (server: Server) => <Observable<CustomResponse>>
    this.http.post<CustomResponse>(`${this.apiUrl}/server/save`, server)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

      saveServerWithUser$ =   (server: Server, id : any) => <Observable<CustomResponse>>
    this.http.post<CustomResponse>(`${this.apiUrl}/server/save/${id}`, server)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );





      saveUser$ = (users: Users) => <Observable<CustomResponse>>
      this.http.post<CustomResponse>(`${this.apiUrl}/user`, users)
        .pipe(
          tap(console.log),
          catchError(this.handleError)
        );


        loginUser$ = (users: Users) => <Observable<CustomResponse>>
        this.http.post<CustomResponse>(`${this.apiUrl}/user/sign-in`, users)
          .pipe(
            tap(console.log),
            catchError(this.handleError)
          );

  ping$ = (ipAddress: string) => <Observable<CustomResponse>>
    this.http.get<CustomResponse>(`${this.apiUrl}/server/ping/${ipAddress}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );


  pingPort$ = (ipAddress: string, port: any) => <Observable<CustomResponse>>
    this.http.get<CustomResponse>(`${this.apiUrl}/server/ping/${ipAddress}/${port}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );
  filter$ = (status: Status, response: CustomResponse) => <Observable<CustomResponse>>
    new Observable<CustomResponse>(
      suscriber => {
        console.log(response);
        suscriber.next(
          status === Status.ALL ? { ...response, message: `Servers filtered by ${status} status` } :
            {
              ...response,
              message: response.data.servers
                .filter(server => server.status === status).length > 0 ? `Servers filtered by 
          ${status === Status.SERVER_UP ? 'SERVER UP'
                : 'SERVER DOWN'} status` : `No servers of ${status} found`,
              data: {
                servers: response.data.servers
                  .filter(server => server.status === status)
              }
            }
        );
        suscriber.complete();
      }
    )
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  delete$ = (serverId: number) => <Observable<CustomResponse>>
    this.http.delete<CustomResponse>(`${this.apiUrl}/server/delete/${serverId}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );


  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(`An error occurred - Error code: ${error.status}`);
  }
}
