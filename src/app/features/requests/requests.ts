import{Component,inject,OnInit,signal}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{ApiService}from'../../core/services/api.service';
import{AuthService}from'../../core/services/auth.service';
@Component({
selector:'app-requests',
imports:[FormsModule],
template:`
<div class="feature-head"><div><h1>Requests</h1><p>Submit and track internal employee requests.</p></div><button (click)="show.set(true)">+ New Request</button></div>
<div class="summary"><div><span>Pending</span><strong>{{count('pending')}}</strong></div><div><span>Approved</span><strong>{{count('approved')}}</strong></div><div><span>Rejected</span><strong>{{count('rejected')}}</strong></div></div>
<div class="table"><div class="tr header"><span>Employee</span><span>Request</span><span>Type</span><span>Status</span><span>Created</span><span></span></div>
@for(r of requests();track r.id){<div class="tr"><span><strong>{{r.user_name}}</strong></span><span>{{r.title}}</span><span>{{r.type}}</span><span><b [class]="r.status">{{r.status}}</b></span><span>{{date(r.created_at)}}</span><span class="row-actions">@if(auth.isAdmin()&&r.status==='pending'){<button (click)="status(r.id,'approved')">?</button><button (click)="status(r.id,'rejected')">×</button>}</span></div>}</div>
@if(show()){<div class="overlay" (click)="show.set(false)"><form class="modal" (click)="$event.stopPropagation()" (ngSubmit)="create()"><h2>New Request</h2><label>Type<select [(ngModel)]="type" name="type"><option value="leave">Leave</option><option value="equipment">Equipment</option><option value="schedule">Schedule</option><option value="other">Other</option></select></label><label>Title<input [(ngModel)]="title" name="title"></label><label>Description<textarea [(ngModel)]="description" name="description"></textarea></label><div><button type="button" class="cancel" (click)="show.set(false)">Cancel</button><button>Submit Request</button></div></form></div>}
`,
styleUrl:'../shared-page.scss'
})
export class Requests implements OnInit{
api=inject(ApiService);auth=inject(AuthService);requests=signal<any[]>([]);show=signal(false);type='leave';title='';description='';
async ngOnInit(){await this.load()}async load(){this.requests.set(await this.api.requests())}
count(s:string){return this.requests().filter(r=>r.status===s).length}date(v:string){return new Date(v+'Z').toLocaleDateString()}
async create(){if(!this.title)return;await this.api.createRequest({type:this.type,title:this.title,description:this.description});this.title=this.description='';this.show.set(false);await this.load()}
async status(id:number,status:string){await this.api.updateRequest(id,status);await this.load()}
}
