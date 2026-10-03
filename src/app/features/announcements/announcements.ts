import{Component,inject,OnInit,signal}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{ApiService}from'../../core/services/api.service';
import{AuthService}from'../../core/services/auth.service';
@Component({
selector:'app-announcements',
imports:[FormsModule],
template:`
<div class="head"><div><h1>Announcements</h1><p>Company news and important CEOSI updates.</p></div>@if(auth.isAdmin()){<button (click)="creating.set(true)">+ New Announcement</button>}</div>
<div class="layout"><main>
@for(a of announcements();track a.id){
<article><div class="announcement-head"><div class="avatar">{{a.initials}}</div><div><strong>{{a.author}}</strong><span>{{date(a.created_at)}}</span></div>@if(a.pinned){<b>?? PINNED</b>}</div><h2>{{a.title}}</h2><p>{{a.body}}</p><footer><button>? Like</button><button>? Comment</button><button>? Share</button></footer></article>
}
</main><aside><div class="side-card"><h3>Announcement Guidelines</h3><p>Announcements are visible to everyone in CEOSI. Use them for important company-wide information and updates.</p></div><div class="side-card"><h3>Quick Stats</h3><div><span>Announcements</span><strong>{{announcements().length}}</strong></div><div><span>Pinned</span><strong>{{pinned}}</strong></div></div></aside></div>
@if(creating()){<div class="overlay" (click)="creating.set(false)"><form class="announce-modal" (click)="$event.stopPropagation()" (ngSubmit)="create()"><h2>New Announcement</h2><label>Title<input [(ngModel)]="title" name="title"></label><label>Message<textarea [(ngModel)]="message" name="message"></textarea></label><label class="check"><input type="checkbox" [(ngModel)]="pinnedNew" name="pinned"> Pin this announcement</label><div><button type="button" class="cancel" (click)="creating.set(false)">Cancel</button><button>Publish</button></div></form></div>}
`,
styleUrl:'./announcements.scss'
})
export class Announcements implements OnInit{
api=inject(ApiService);auth=inject(AuthService);announcements=signal<any[]>([]);creating=signal(false);title='';message='';pinnedNew=false;
async ngOnInit(){await this.load()}async load(){this.announcements.set(await this.api.announcements())}
get pinned(){return this.announcements().filter(a=>a.pinned).length}
date(v:string){return new Date(v+'Z').toLocaleString()}
async create(){if(!this.title.trim()||!this.message.trim())return;await this.api.createAnnouncement({title:this.title,body:this.message,pinned:this.pinnedNew});this.title=this.message='';this.pinnedNew=false;this.creating.set(false);await this.load()}
}
