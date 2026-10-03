import{Injectable,signal}from'@angular/core';
import{Router}from'@angular/router';
@Injectable({providedIn:'root'})
export class AuthService{
user=signal<any>(this.read());
constructor(private router:Router){}
private read(){try{return JSON.parse(localStorage.getItem('ceonix_user')||'null')}catch{return null}}
set(user:any){localStorage.setItem('ceonix_user',JSON.stringify(user));this.user.set(user)}
logout(){localStorage.removeItem('ceonix_user');this.user.set(null);this.router.navigateByUrl('/login')}
id(){return this.user()?.id||1}
isAdmin(){return !!this.user()?.is_admin}
}
