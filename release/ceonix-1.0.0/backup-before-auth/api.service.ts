import{Injectable,inject}from'@angular/core';
import{HttpClient}from'@angular/common/http';
import{firstValueFrom}from'rxjs';
import{AuthService}from'./auth.service';
@Injectable({providedIn:'root'})
export class ApiService{
readonly base=location.protocol==='http:'&&(location.hostname==='localhost'||location.hostname==='127.0.0.1')?'http://localhost:8787/api':'https://ceonix.marvills.workers.dev/api';
auth=inject(AuthService);
constructor(private http:HttpClient){}
get<T>(p:string){return firstValueFrom(this.http.get<T>(this.base+p))}
post<T>(p:string,d:any={}){return firstValueFrom(this.http.post<T>(this.base+p,d))}
patch<T>(p:string,d:any={}){return firstValueFrom(this.http.patch<T>(this.base+p,d))}
login(email:string){return this.post<any>('/login',{email})}
users(){return this.get<any[]>('/users')}
channels(){return this.get<any[]>('/channels')}
messages(c:string){return this.get<any[]>('/messages/'+c)}
sendMessage(channelId:number,content:string){return this.post('/messages',{channelId,userId:this.auth.id(),content})}
meals(){return this.get<any[]>('/meals')}
addMeal(name:string,emoji:string){return this.post('/meals',{name,emoji,userId:this.auth.id()})}
voteMeal(id:number){return this.post('/meals/'+id+'/vote',{userId:this.auth.id()})}
polls(){return this.get<any[]>('/polls')}
createPoll(question:string,options:string[]){return this.post('/polls',{question,options,userId:this.auth.id()})}
votePoll(id:number,optionId:number){return this.post('/polls/'+id+'/vote',{userId:this.auth.id(),optionId})}
announcements(){return this.get<any[]>('/announcements')}
createAnnouncement(d:any){return this.post('/announcements',{...d,userId:this.auth.id()})}
events(){return this.get<any[]>('/events')}
createEvent(d:any){return this.post('/events',{...d,userId:this.auth.id()})}
requests(){return this.get<any[]>('/requests')}
createRequest(d:any){return this.post('/requests',{...d,userId:this.auth.id()})}
updateRequest(id:number,status:string){return this.patch('/requests/'+id,{status,userId:this.auth.id()})}
notifications(){return this.get<any[]>('/notifications?userId='+this.auth.id())}
readNotification(id:number){return this.patch('/notifications/'+id+'/read')}
readAll(){return this.patch('/notifications/read-all',{userId:this.auth.id()})}
settings(){return this.get<any>('/settings?userId='+this.auth.id())}
saveSettings(d:any){return this.patch('/settings',{...d,userId:this.auth.id()})}
updateUser(id:number,d:any){return this.patch<any>('/users/'+id,d)}
files(){return this.get<any[]>('/files')}
uploadFile(file:File){
const form=new FormData();
form.append('file',file);
form.append('userId',String(this.auth.id()));
return firstValueFrom(this.http.post<any>(this.base+'/files/upload',form))
}
deleteFile(id:number){return this.delete<any>('/files/'+id)}
downloadUrl(id:number){return this.base+'/files/'+id+'/download'}
delete<T>(p:string){return firstValueFrom(this.http.delete<T>(this.base+p))}
dashboard(){return this.get<any>('/dashboard')}
}


