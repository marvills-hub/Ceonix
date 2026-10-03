import{Component,inject,signal}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{Router}from'@angular/router';
import{ApiService}from'../../core/services/api.service';
import{AuthService}from'../../core/services/auth.service';
@Component({
selector:'app-login',
imports:[FormsModule],
template:`
<div class="login">
<div class="panel">
<div class="brand"><span>C</span><div><strong>CEONIX</strong><small>CEOSI Connect</small></div></div>
<div class="welcome"><h1>Welcome back</h1><p>Sign in with your CEOSI employee account.</p></div>
<form (ngSubmit)="login()">
<label>Work email<input [(ngModel)]="email" name="email" type="email" placeholder="name@ceosi.local" required></label>
@if(error()){<div class="error">{{error()}}</div>}
<button [disabled]="loading()">{{loading()?'Signing in...':'Sign in to Ceonix'}}</button>
</form>
<div class="demo"><strong>Development accounts</strong><button (click)="email='marben@ceosi.local'">marben&#64;ceosi.local</button><button (click)="email='angela@ceosi.local'">angela&#64;ceosi.local</button></div>
</div>
<div class="visual"><div><span>CEOSI</span><h2>One place for your entire team.</h2><p>Connect. Decide. Collaborate.</p></div></div>
</div>
`,
styles:[`
:host{display:block}.login{min-height:100vh;display:grid;grid-template-columns:520px 1fr;background:#fff}.panel{padding:50px 70px;display:flex;flex-direction:column}.brand{display:flex;align-items:center;gap:10px}.brand>span{width:40px;height:40px;border-radius:11px;background:#4f46e5;color:#fff;display:grid;place-items:center;font-size:20px;font-weight:800}.brand>div{display:flex;flex-direction:column}.brand strong{letter-spacing:1.5px}.brand small{color:#98a2b3}.welcome{margin-top:auto}.welcome h1{font-size:30px;margin:0}.welcome p{color:#667085;font-size:13px}.panel form{margin:25px 0}.panel label{display:flex;flex-direction:column;gap:7px;font-size:11px;font-weight:600}.panel input{height:44px;border:1px solid #d0d5dd;border-radius:8px;padding:0 12px;outline:0}.panel form button{width:100%;height:44px;border:0;border-radius:8px;background:#4f46e5;color:#fff;font-weight:700;margin-top:18px}.error{background:#fef3f2;color:#b42318;padding:9px;border-radius:7px;font-size:11px;margin-top:10px}.demo{margin-bottom:auto;background:#f9fafb;padding:12px;border-radius:9px;display:flex;flex-direction:column;gap:5px;font-size:10px}.demo button{border:0;background:transparent;color:#4f46e5;text-align:left;padding:2px}.visual{background:#101828;display:grid;place-items:center;color:#fff;padding:70px}.visual>div{max-width:550px}.visual span{color:#818cf8;font-size:12px;font-weight:800;letter-spacing:4px}.visual h2{font-size:48px;line-height:1.05;margin:18px 0}.visual p{color:#98a2b3;font-size:18px}@media(max-width:850px){.login{grid-template-columns:1fr}.visual{display:none}.panel{padding:35px;min-height:100vh}}
`]
})
export class Login{
api=inject(ApiService);auth=inject(AuthService);router=inject(Router);
email='marben@ceosi.local';loading=signal(false);error=signal('');
async login(){if(!this.email)return;this.loading.set(true);this.error.set('');try{const r=await this.api.login(this.email);this.auth.set(r.user);this.router.navigateByUrl('/')}catch(e:any){this.error.set(e?.error?.error||'Unable to sign in')}finally{this.loading.set(false)}}
}
