import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CustomResponse } from '../interface/custom-response';
import { UserState } from '../interface/user-state';
import { Users } from '../interface/users';
import { NotificationService } from '../service/notification.service';
import { ServerService } from '../service/server.service';
import { DataState } from '../enum/data-state.enum';
import { catchError, map, startWith } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  userState$: Observable<UserState<CustomResponse>>;
  private isLoading = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<CustomResponse>(null);
  isLoading$ = this.isLoading.asObservable();
  private readonly apiUrl = 'http://localhost:8089/user';
  // message: string;
  signedInStatus: any;
  constructor(private serverService: ServerService, private notifier:NotificationService) { }

  ngOnInit(): void {
    this.signedInStatus = localStorage.getItem('signedin');
  this.userState$ =  this.serverService.users$
      .pipe(
        map(response => {
          this.notifier.onDefault(response.message);
          this.userSubject.next(response);
          return { dataState: DataState.LOADED_STATE, appData: { ...response, data: { users: response.data.users.reverse() } } }
        }),
        startWith({ dataState: DataState.LOADING_STATE }),
        catchError((error: string) => {
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
     
  }

  saveUser(userForm: NgForm): void {

  
  
    this.serverService.saveUser$(userForm.value).subscribe(
      response=> {
        this.notifier.onDefault(response.message);
        
        document.getElementById('closeModal').click();
      }
      
    ), error => {
      console.log(error);

    }

    

  }
  





}
