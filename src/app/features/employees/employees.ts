import{Component,inject,OnInit,signal}from'@angular/core';
import{FormsModule}from'@angular/forms';
import{ApiService}from'../../core/services/api.service';
@Component({
selector:'app-employees',
imports:[FormsModule],
template:`
<div class="head"><div><h1>Employees</h1><p>{{filtered.length}} people in the CEOSI directory</p></div><button>+ Add Employee</button></div>
<div class="tools"><input [(ngModel)]="search" placeholder="Search employees..."><select [(ngModel)]="department"><option>All Departments</option>@for(d of departments;track d){<option>{{d}}</option>}</select></div>
@if(loading()){<div class="loading">Loading employees...</div>}
<div class="employees">
@for(e of filtered;track e.id){
<div class="employee"><div class="avatar">{{e.initials}}<i [class.offline]="e.status!=='online'"></i></div><div class="info"><h3>{{e.name}}</h3><p>{{e.role}}</p><span>{{e.department}}</span></div><div class="actions"><button>?</button><button>•••</button></div></div>
}
</div>
`,
styleUrl:'./employees.scss'
})
export class Employees implements OnInit{
api=inject(ApiService);
employees=signal<any[]>([]);
loading=signal(true);
search='';
department='All Departments';
async ngOnInit(){
try{this.employees.set(await this.api.users())}
catch(e){console.error(e)}
finally{this.loading.set(false)}
}
get departments(){return [...new Set(this.employees().map(e=>e.department))].sort()}
get filtered(){
const q=this.search.toLowerCase();
return this.employees().filter(e=>(this.department==='All Departments'||e.department===this.department)&&(e.name.toLowerCase().includes(q)||e.role.toLowerCase().includes(q)||e.department.toLowerCase().includes(q)));
}
}
