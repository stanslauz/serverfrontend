import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, isEmpty, map, startWith } from 'rxjs/operators';
import { DataState } from './enum/data-state.enum';
import { Status } from './enum/status.enum';
import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-response';
import { Server } from './interface/server';
import { UserState } from './interface/user-state';
import { Users } from './interface/users';
import { NotificationService } from './service/notification.service';
import { ServerService } from './service/server.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  userState$: Observable<UserState<CustomResponse>>;
  appState$: Observable<AppState<CustomResponse>>;
  
  readonly DataState = DataState;
  // readonly DataStateUser = DataState;
  readonly Status = Status;
  private filterSubject = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<CustomResponse>(null);
  private userSubject = new BehaviorSubject<CustomResponse>(null);
  filterStatus$ = this.filterSubject.asObservable();
  private isLoading = new BehaviorSubject<boolean>(false);
  private isLoadingUser = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();


  constructor(private serverService: ServerService, private notifier: NotificationService) { }

  ngOnInit(): void {
  
    // this.appState$ = this.serverService.servers$
    //   .pipe(
    //     map(response => {
    //       this.notifier.onDefault(response.message);
    //       this.dataSubject.next(response);
    //       return { dataState: DataState.LOADED_STATE, appData: { ...response, data: { servers: response.data.servers.reverse() } } }
    //     }),
    //     startWith({ dataState: DataState.LOADING_STATE }),
    //     catchError((error: string) => {
    //       this.notifier.onError(error);
    //       return of({ dataState: DataState.ERROR_STATE, error });
    //     })
    //   );
      
      this.appState$ =  this.serverService.users$
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
        

    
      //  this.userState$ = this.serverService.users$
      // .pipe(
      //   map(response => {
      //     this.notifier.onDefault(response.message);
      //     this.userSubject.next(response);
      //     return { dataState: DataState.LOADED_STATE, appData: { ...response, data: { users: response.data.users.reverse() } } }
      //   }),
      //   startWith({ dataState: DataState.LOADING_STATE }),
      //   catchError((error: string) => {
      //     this.notifier.onError(error);
      //     return of({ dataState: DataState.ERROR_STATE, error });
      //   })
      // );
     
  }

  pingServer(ipAddress: string): void {
    this.filterSubject.next(ipAddress);
    this.appState$ = this.serverService.ping$(ipAddress)
      .pipe(
        map(response => {
          const index = this.dataSubject.value.data.servers.findIndex(server =>  server.id === response.data.server.id);   
          this.dataSubject.value.data.servers[index] = response.data.server;
          this.notifier.onDefault(response.message);
          this.filterSubject.next('');
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
         
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.filterSubject.next('');
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
    
  }

  
  pingPort(ipAddress: string, port: any): void {

    
    this.filterSubject.next(ipAddress);
    
    this.appState$ = this.serverService.pingPort$(ipAddress, port)
      .pipe(
        map(response => {   
          this.dataSubject.value.data.servers[this.dataSubject.value.data.servers.findIndex(x => x.port == port  && x.ipAddress == ipAddress)] = response.data.server;
          this.notifier.onDefault(response.message);
          this.filterSubject.next('');

          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.filterSubject.next('');  
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
       
        
  }

  saveServer(serverForm: NgForm): void {
 
    if(serverForm.value.port > 65536){
      this.notifier.onDefault("port does not exist");
    }else{

      this.isLoading.next(true);
      this.appState$ = this.serverService.save$(serverForm.value as Server)
        .pipe(
          map(response => {
            this.dataSubject.next(
              {...response, data: { servers: [response.data.server, ...this.dataSubject.value.data.servers] } }
            );
            this.notifier.onDefault(response.message);
            document.getElementById('closeModal').click();
            this.isLoading.next(false);
            serverForm.resetForm({ status: this.Status.SERVER_DOWN });
            return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
          }),
          startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
          catchError((error: string) => {
            this.isLoading.next(false);
            this.notifier.onError(error);
            return of({ dataState: DataState.ERROR_STATE, error });
          })
        );
    }

}

saveUser(userForm: NgForm): void {
 
 

    this.isLoading.next(true);
    this.appState$ = this.serverService.saveUser$(userForm.value as Users)
      .pipe(
        map(response => {
          this.userSubject.next(
            {...response, data: { users: [response.data?.user, ...this.userSubject.value.data.users] } }
            
          );
          console.log("we re here");
          this.notifier.onDefault(response.message);
          document.getElementById('closeModal1').click();
          this.isLoading.next(false);
          // serverForm.resetForm({ status: this.Status.SERVER_DOWN });
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.isLoading.next(false);
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
  

}




// saveUser(userForm: NgForm): void {
 

//     this.isLoadingUser.next(true);
//     console.log(userForm.value);
//     console.log("this is the functions");
//     this.serverService.saveUser$(userForm.value as Users)
//           .pipe(
            
//             map(response => {
//               this.userSubject.next(
                 
//                 {...response, data: { users: [response.data.user, ...this.userSubject.value.data.users] } }
//               );

//               console.log(userForm.value);
//               this.notifier.onDefault(response.message);
//               document.getElementById('closeModal1').click();
//               this.isLoading.next(false);
//               // userForm.resetForm({ name });
//               return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
//             }),
//             startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
//             catchError((error: string) => {
//               this.isLoadingUser.next(false);
//               this.notifier.onError(error);
//               return of({ dataState: DataState.ERROR_STATE, error });
//             })
//           );
       
//   // this.serverService.save(userForm.value as Users);
//   // console.log(userForm.value);
// }

  filterServers(status: Status): void {
    this.appState$ = this.serverService.filter$(status, this.dataSubject.value)
      .pipe(
        map(response => {
          this.notifier.onDefault(response.message);
          return { dataState: DataState.LOADED_STATE, appData: response };
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
  }

  deleteServer(server: Server): void {
    this.appState$ = this.serverService.delete$(server.id)
      .pipe(
        map(response => {
          this.dataSubject.next(
            { ...response, data: 
              { servers: this.dataSubject.value.data.servers.filter(s => s.id !== server.id)} }
          );
          this.notifier.onDefault(response.message);
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
  }

  printReport(): void {
    this.notifier.onDefault('Report downloaded');
    // window.print();
    let dataType = 'application/vnd.ms-excel.sheet.macroEnabled.12';
    let tableSelect = document.getElementById('servers');
    let tableHtml = tableSelect.outerHTML.replace(/ /g, '%20');
    let downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);
    downloadLink.href = 'data:' + dataType + ', ' + tableHtml;
    downloadLink.download = 'server-report.xls';
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
