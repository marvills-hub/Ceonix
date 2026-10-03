import{Injectable,inject}from'@angular/core';
import{HttpClient,HttpHeaders}from'@angular/common/http';
import{firstValueFrom}from'rxjs';
import{AuthService}from'./auth.service';
@Injectable({providedIn:'root'})
export class ApiService{
readonly base=location.protocol==='http:'&&(location.hostname==='localhost'||location.hostname==='127.0.0.1')?'http://localhost:8787/api':'https://ceonix.marvills.workers.dev/api';
auth=inject(AuthService);
constructor(private http:HttpClient){}
private options(){
const token=this.auth.token();
return token?{headers:new HttpHeaders({Authorization:`Bearer ${token}`})}:{};
}
get<T>(p:string){return firstValueFrom(this.http.get<T>(this.base+p,this.options()))}
post<T>(p:string,d:any={}){return firstValueFrom(this.http.post<T>(this.base+p,d,this.options()))}
patch<T>(p:string,d:any={}){return firstValueFrom(this.http.patch<T>(this.base+p,d,this.options()))}
delete<T>(p:string){return firstValueFrom(this.http.delete<T>(this.base+p,this.options()))}
login(email:string,password:string){return this.post<any>('/login',{email,password})}
logout(){return this.post('/logout')}
me(){return this.get<any>('/me')}
users(){return this.get<any[]>('/users')}
channels(){return this.get<any[]>('/channels')}
messages(c:string){return this.get<any[]>('/messages/'+c)}
sendMessage(channelId:number,content:string){return this.post('/messages',{channelId,content})}
meals(){return this.get<any[]>('/meals')}
addMeal(name:string,emoji:string){return this.post('/meals',{name,emoji})}
voteMeal(id:number){return this.post('/meals/'+id+'/vote')}
polls(){return this.get<any[]>('/polls')}
createPoll(question:string,options:string[]){return this.post('/polls',{question,options})}
votePoll(id:number,optionId:number){return this.post('/polls/'+id+'/vote',{optionId})}
announcements(){return this.get<any[]>('/announcements')}
createAnnouncement(d:any){return this.post('/announcements',d)}
events(){return this.get<any[]>('/events')}
createEvent(d:any){return this.post('/events',d)}
requests(){return this.get<any[]>('/requests')}
createRequest(d:any){return this.post('/requests',d)}
updateRequest(id:number,status:string){return this.patch('/requests/'+id,{status})}
notifications(){return this.get<any[]>('/notifications')}
readNotification(id:number){return this.patch('/notifications/'+id+'/read')}
readAll(){return this.patch('/notifications/read-all')}
settings(){return this.get<any>('/settings')}
saveSettings(d:any){return this.patch('/settings',d)}
updateUser(id:number,d:any){return this.patch<any>('/users/'+id,d)}
files(){return this.get<any[]>('/files')}
uploadFile(file:File){
const form=new FormData();
form.append('file',file);
return firstValueFrom(this.http.post<any>(this.base+'/files/upload',form,this.options()))
}
deleteFile(id:number){return this.delete<any>('/files/'+id)}
downloadUrl(id:number){return this.base+'/files/'+id+'/download'}
dashboard(){return this.get<any>('/dashboard')}
}
