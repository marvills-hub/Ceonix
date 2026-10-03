import{Component,inject,OnInit,signal}from'@angular/core';
import{ApiService}from'../../core/services/api.service';
import{AuthService}from'../../core/services/auth.service';
@Component({
selector:'app-admin',
template:`
<div class="feature-head"><div><h1>Administration</h1><p>Manage the Ceonix organization.</p></div></div>
@if(!auth.isAdmin()){<div class="empty"><h2>Administrator access required</h2><p>Your account cannot access this section.</p></div>}
@else{
<div class="summary"><div><span>Total Employees</span><strong>{{users().length}}</strong></div><div><span>Online</span><strong>{{online}}</strong></div><div><span>Departments</span><strong>{{departments}}</strong></div></div>
<div class="table"><div class="tr header"><span>Employee</span><span>Role</span><span>Department</span><span>Status</span><span>Access</span><span></span></div>
@for(u of users();track u.id){<div class="tr"><span><strong>{{u.name}}</strong><small>{{u.email}}</small></span><span>{{u.role}}</span><span>{{u.department}}</span><span>{{u.status}}</span><span>{{u.is_admin?'Administrator':'Employee'}}</span><span>•••</span></div>}</div>
}
`,
styleUrl:'../shared-page.scss'
})
export class Admin implements OnInit{
api=inject(ApiService);auth=inject(AuthService);users=signal<any[]>([]);
async ngOnInit(){if(this.auth.isAdmin())this.users.set(await this.api.users())}
get online(){return this.users().filter(u=>u.status==='online').length}
get departments(){return new Set(this.users().map(u=>u.department)).size}
}
