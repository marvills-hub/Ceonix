import{Component,Input}from'@angular/core';
@Component({
selector:'app-feature-page',
template:`
<div class="feature-head">
<div><h1>{{title}}</h1><p>{{description}}</p></div>
<button>+ {{action}}</button>
</div>
<div class="feature-card">
<div class="empty-icon">{{icon}}</div>
<h2>{{title}}</h2>
<p>{{message}}</p>
<button>{{action}}</button>
</div>
`,
styles:[`
.feature-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.feature-head h1{margin:0;font-size:25px}
.feature-head p{color:#667085;margin:5px 0;font-size:13px}
.feature-head button,.feature-card button{border:0;background:#4f46e5;color:#fff;border-radius:8px;padding:10px 15px;font-weight:600}
.feature-card{min-height:420px;background:#fff;border:1px solid #eaecf0;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px}
.feature-card p{color:#667085;max-width:480px;line-height:1.6}
.empty-icon{width:64px;height:64px;border-radius:16px;background:#eef2ff;color:#4f46e5;display:grid;place-items:center;font-size:28px}
.feature-card h2{margin-bottom:0}
`]
})
export class FeaturePage{
@Input()title='';
@Input()description='';
@Input()action='';
@Input()icon='';
@Input()message='This Ceonix module is ready for its full functionality.';
}
