import{Component,inject,signal}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{ApiService}from'../../core/services/api.service';
import{AuthService}from'../../core/services/auth.service';
@Component({
selector:'app-profile',
imports:[FormsModule],
template:`
<div class="feature-head"><div><h1>Profile</h1><p>Manage your Ceonix identity.</p></div></div>
<div class="profile-card"><div class="profile-top"><div class="big-avatar">{{auth.user()?.initials}}</div><div><h2>{{auth.user()?.name}}</h2><p>{{auth.user()?.role}} · {{auth.user()?.department}}</p></div></div>
<div class="form-grid"><label>Full name<input [(ngModel)]="name"></label><label>Role<input [(ngModel)]="role"></label><label>Department<input [(ngModel)]="department"></label><label>Phone<input [(ngModel)]="phone"></label><label class="full">Bio<textarea [(ngModel)]="bio"></textarea></label></div>
<button class="primary" (click)="save()">{{saved()?'Saved ?':'Save Profile'}}</button></div>
`,
styleUrl:'../shared-page.scss'
})
export class Profile{
api=inject(ApiService);auth=inject(AuthService);saved=signal(false);
name=this.auth.user()?.name||'';role=this.auth.user()?.role||'';department=this.auth.user()?.department||'';phone=this.auth.user()?.phone||'';bio=this.auth.user()?.bio||'';
async save(){const u=await this.api.updateUser(this.auth.id(),{name:this.name,role:this.role,department:this.department,phone:this.phone,bio:this.bio});this.auth.set(u);this.saved.set(true);setTimeout(()=>this.saved.set(false),1500)}
}
