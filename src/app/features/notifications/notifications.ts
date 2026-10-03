import{Component,inject,OnInit,signal}from'@angular/core';
import{Router}from'@angular/router';
import{ApiService}from'../../core/services/api.service';
@Component({
selector:'app-notifications',
template:`
<div class="feature-head"><div><h1>Notifications</h1><p>Everything that needs your attention.</p></div><button (click)="readAll()">Mark All Read</button></div>
<div class="notification-list">
@for(n of notifications();track n.id){
<button class="notification" [class.read]="n.is_read" (click)="open(n)"><div class="notice-icon">{{icon(n.type)}}</div><div><strong>{{n.title}}</strong><p>{{n.body}}</p><span>{{date(n.created_at)}}</span></div>@if(!n.is_read){<i></i>}</button>
}
@if(!notifications().length){<div class="empty">You're all caught up.</div>}
</div>
`,
styleUrl:'../shared-page.scss'
})
export class Notifications implements OnInit{
api=inject(ApiService);router=inject(Router);notifications=signal<any[]>([]);
async ngOnInit(){await this.load()}async load(){this.notifications.set(await this.api.notifications())}
icon(t:string){return t==='poll'?'?':t==='meal'?'?':t==='announcement'?'?':'?'}date(v:string){return new Date(v+'Z').toLocaleString()}
async open(n:any){if(!n.is_read)await this.api.readNotification(n.id);if(n.link)this.router.navigateByUrl(n.link);else await this.load()}
async readAll(){await this.api.readAll();await this.load()}
}
