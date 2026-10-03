import{Component,inject,OnInit,signal}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{ApiService}from'../../core/services/api.service';
@Component({
selector:'app-polls',
imports:[FormsModule],
template:`
<div class="head"><div><h1>Polls & Voting</h1><p>Make decisions together with the CEOSI team.</p></div><button (click)="creating.set(true)">+ Create Poll</button></div>
<div class="tabs"><button class="active">Active <span>{{polls().length}}</span></button><button>My Polls</button><button>Closed</button></div>
@if(loading()){<div class="loading">Loading polls...</div>}
<div class="polls">
@for(p of polls();track p.id){
<article class="poll">
<div class="poll-head"><div><span class="status">? {{p.status.toUpperCase()}}</span><h2>{{p.question}}</h2><p>Created by {{p.author}} · {{endLabel(p.closes_at)}}</p></div><button class="more">•••</button></div>
<div class="options">
@for(o of p.options;track o.id){
<button class="option" (click)="vote(p,o)" [disabled]="voting()===p.id">
<div><span>{{o.label}}</span><strong>{{o.votes}} votes · {{percentage(p,o.votes)}}%</strong></div>
<div class="bar"><i [style.width.%]="percentage(p,o.votes)"></i></div>
</button>
}
</div>
<footer><span>? {{total(p)}} total votes</span><strong>Select an option to vote</strong></footer>
</article>
}
</div>
@if(creating()){
<div class="overlay" (click)="creating.set(false)">
<form class="modal" (click)="$event.stopPropagation()" (ngSubmit)="createPoll()">
<h2>Create Poll</h2><p>Ask the CEOSI team a question.</p>
<label>Question<input [(ngModel)]="question" name="question" placeholder="What would you like to ask?"></label>
<label>Option 1<input [(ngModel)]="option1" name="option1"></label>
<label>Option 2<input [(ngModel)]="option2" name="option2"></label>
<label>Option 3<input [(ngModel)]="option3" name="option3"></label>
<div class="actions"><button type="button" class="cancel" (click)="creating.set(false)">Cancel</button><button [disabled]="saving()">{{saving()?'Creating...':'Create Poll'}}</button></div>
</form>
</div>
}
`,
styleUrl:'./polls.scss'
})
export class Polls implements OnInit{
api=inject(ApiService);
polls=signal<any[]>([]);
loading=signal(true);
creating=signal(false);
saving=signal(false);
voting=signal<number|null>(null);
question='';option1='';option2='';option3='';
async ngOnInit(){await this.load()}
async load(){
this.loading.set(true);
try{this.polls.set(await this.api.polls())}
catch(e){console.error(e);this.polls.set([])}
finally{this.loading.set(false)}
}
total(p:any){return p.options.reduce((n:number,o:any)=>n+Number(o.votes||0),0)}
percentage(p:any,v:number){const t=this.total(p);return t?Math.round(Number(v)/t*100):0}
endLabel(value:string){return value?'Ends '+new Date(value+'Z').toLocaleString():'No closing date'}
async vote(p:any,o:any){
this.voting.set(p.id);
try{await this.api.votePoll(p.id,o.id);await this.load()}
catch(e:any){alert(e?.error?.error||'You may have already voted in this poll.')}
finally{this.voting.set(null)}
}
async createPoll(){
const options=[this.option1,this.option2,this.option3].map(v=>v.trim()).filter(Boolean);
if(!this.question.trim()||options.length<2||this.saving())return;
this.saving.set(true);
try{
await this.api.createPoll(this.question.trim(),options);
this.question=this.option1=this.option2=this.option3='';
this.creating.set(false);
await this.load();
}catch(e){console.error(e)}
finally{this.saving.set(false)}
}
}
