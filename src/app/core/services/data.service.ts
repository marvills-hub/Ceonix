import{Injectable,signal}from'@angular/core';
export interface Employee{id:number;name:string;role:string;department:string;initials:string;online:boolean}
export interface Message{id:number;sender:string;initials:string;text:string;time:string;mine?:boolean}
export interface Meal{id:number;name:string;emoji:string;votes:number;voted?:boolean}
export interface PollOption{id:number;label:string;votes:number}
export interface Poll{id:number;question:string;author:string;ends:string;options:PollOption[];voted?:number}
export interface Announcement{id:number;title:string;body:string;author:string;time:string;pinned:boolean}
@Injectable({providedIn:'root'})
export class DataService{
employees=signal<Employee[]>([
{id:1,name:'Marben Villaflor',role:'Software Developer',department:'Development',initials:'MV',online:true},
{id:2,name:'Angela Reyes',role:'Project Manager',department:'Management',initials:'AR',online:true},
{id:3,name:'Joshua Santos',role:'Frontend Developer',department:'Development',initials:'JS',online:true},
{id:4,name:'Nicole Garcia',role:'QA Engineer',department:'Quality Assurance',initials:'NG',online:false},
{id:5,name:'Carlo Mendoza',role:'UI/UX Designer',department:'Design',initials:'CM',online:true},
{id:6,name:'Sofia Cruz',role:'HR Specialist',department:'Human Resources',initials:'SC',online:false}
]);
messages=signal<Message[]>([
{id:1,sender:'Angela Reyes',initials:'AR',text:'Good morning team! How is everyone doing?',time:'9:02 AM'},
{id:2,sender:'Joshua Santos',initials:'JS',text:'Morning! Everything is good here. Working on the new dashboard.',time:'9:05 AM'},
{id:3,sender:'Marben Villaflor',initials:'MV',text:'Nice. I am working on Ceonix today ??',time:'9:07 AM',mine:true},
{id:4,sender:'Angela Reyes',initials:'AR',text:'Awesome! Looking forward to seeing it.',time:'9:08 AM'}
]);
meals=signal<Meal[]>([
{id:1,name:'Chicken Inasal',emoji:'??',votes:24},
{id:2,name:'Pancit Canton',emoji:'??',votes:16},
{id:3,name:'Burger & Fries',emoji:'??',votes:10},
{id:4,name:'Sisig',emoji:'??',votes:7}
]);
polls=signal<Poll[]>([
{id:1,question:'What should we do for our next team building activity?',author:'Angela Reyes',ends:'Today, 5:00 PM',options:[{id:1,label:'Beach Resort',votes:18},{id:2,label:'Mountain Trip',votes:13},{id:3,label:'Indoor Games',votes:7}]},
{id:2,question:'Which snacks should we add to the office pantry?',author:'Sofia Cruz',ends:'Oct 5',options:[{id:1,label:'Chips & Crackers',votes:12},{id:2,label:'Fruits',votes:9},{id:3,label:'Cookies',votes:15}]},
{id:3,question:'Friday office theme?',author:'Carlo Mendoza',ends:'Oct 7',options:[{id:1,label:'Casual Friday',votes:14},{id:2,label:'Retro',votes:6},{id:3,label:'Anime',votes:11}]}
]);
announcements=signal<Announcement[]>([
{id:1,title:'Monthly Town Hall',body:'Our monthly company-wide town hall will be held this Friday at 3:00 PM. Everyone is encouraged to attend.',author:'Management',time:'2 hours ago',pinned:true},
{id:2,title:'Welcome New Team Members!',body:'Please welcome our newest teammates joining CEOSI this month. Say hello when you see them!',author:'Human Resources',time:'Yesterday',pinned:false},
{id:3,title:'Updated Office Guidelines',body:'The updated office guidelines are now available. Please review the changes before Monday.',author:'Administration',time:'2 days ago',pinned:false}
]);
sendMessage(text:string){
const value=text.trim();
if(!value)return;
this.messages.update(items=>[...items,{id:Date.now(),sender:'Marben Villaflor',initials:'MV',text:value,time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),mine:true}]);
}
voteMeal(id:number){
this.meals.update(items=>items.map(m=>m.id===id&&!m.voted?{...m,votes:m.votes+1,voted:true}:m));
}
votePoll(pollId:number,optionId:number){
this.polls.update(items=>items.map(p=>{
if(p.id!==pollId||p.voted)return p;
return{...p,voted:optionId,options:p.options.map(o=>o.id===optionId?{...o,votes:o.votes+1}:o)};
}));
}
}
