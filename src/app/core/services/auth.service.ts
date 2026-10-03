import{Injectable,signal}from'@angular/core';
import{Router}from'@angular/router';
@Injectable({providedIn:'root'})
export class AuthService{
user=signal<any>(this.readUser());
constructor(private router:Router){}
private readUser(){try{return JSON.parse(localStorage.getItem('ceonix_user')||'null')}catch{return null}}
token(){return localStorage.getItem('ceonix_token')||''}
set(user:any,token?:string){
localStorage.setItem('ceonix_user',JSON.stringify(user));
if(token)localStorage.setItem('ceonix_token',token);
this.user.set(user);
}
clear(){
localStorage.removeItem('ceonix_user');
localStorage.removeItem('ceonix_token');
this.user.set(null);
}
logout(){this.clear();this.router.navigateByUrl('/login')}
id(){return this.user()?.id||0}
isAdmin(){return !!this.user()?.is_admin}
}
