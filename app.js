const $ = id => document.getElementById(id);
let processes = [];
let schedule = [];
let timer = null;
let elapsed = 0;
let colors = ['#2864b4','#168b83','#8056b5','#d17a32','#c14f72','#547b45'];

function addProcess(name, arrival, burst) {
  if (!name || !Number.isInteger(arrival) || arrival < 0 || !Number.isInteger(burst) || burst < 1) {
    alert('نام فرایند و زمان‌های معتبر وارد کنید. زمان ورود باید صفر یا بیشتر و زمان اجرا حداقل ۱ باشد.');
    return;
  }
  if (processes.some(p => p.name === name)) { alert('نام این فرایند تکراری است.'); return; }
  processes.push({name, arrival, burst});
  render();
}
function calculate() {
  let now = 0;
  schedule = [...processes].sort((a,b)=>a.arrival-b.arrival || a.name.localeCompare(b.name))
    .map((p,i)=>{
      const start = Math.max(now,p.arrival);
      const end = start + p.burst;
      const waiting = start - p.arrival;
      const turnaround = end - p.arrival;
      now = end;
      return {...p,start,end,waiting,turnaround,color:colors[i%colors.length]};
    });
}
function render() {
  $('processRows').innerHTML = processes.map((p,i)=>`<tr><td>${p.name}</td><td>${p.arrival}</td><td>${p.burst}</td><td><button class="delete" data-index="${i}">حذف</button></td></tr>`).join('');
  document.querySelectorAll('.delete').forEach(b=>b.onclick=()=>{processes.splice(+b.dataset.index,1);reset();render();});
  calculate();
  $('resultRows').innerHTML = schedule.map(p=>`<tr><td>${p.name}</td><td>${p.arrival}</td><td>${p.burst}</td><td>${p.start}</td><td>${p.end}</td><td>${p.waiting}</td><td>${p.turnaround}</td></tr>`).join('');
  const avg = key => schedule.length ? (schedule.reduce((s,p)=>s+p[key],0)/schedule.length).toFixed(2) : '—';
  $('avgWait').textContent=avg('waiting'); $('avgTurn').textContent=avg('turnaround');
  drawGantt();
}
function drawGantt() {
  const g=$('gantt'), ticks=$('ticks');
  if(!schedule.length){g.className='gantt empty';g.textContent='ابتدا حداقل یک فرایند اضافه کنید.';ticks.innerHTML='';return;}
  g.className='gantt';g.innerHTML='';ticks.innerHTML='';
  const total=schedule[schedule.length-1].end;
  schedule.forEach((p,i)=>{
    if(p.start > (i?schedule[i-1].end:0)){
      const idle=document.createElement('div');idle.className='block';idle.style.flex=p.start-(i?schedule[i-1].end:0);idle.style.background='#9aa5b5';idle.textContent='Idle';g.append(idle);
    }
    const b=document.createElement('div');b.className='block';b.dataset.name=p.name;b.style.flex=p.burst;b.style.background=p.color;b.textContent=p.name;g.append(b);
  });
  for(let t=0;t<=total;t++){const s=document.createElement('span');s.textContent=t;ticks.append(s);}
}
function reset(){pause();elapsed=0;$('clock').textContent='زمان شبیه‌سازی: 0';$('progressBar').style.width='0%';$('status').textContent='آماده اجرا';document.querySelectorAll('.block').forEach(b=>b.classList.remove('active'));}
function pause(){if(timer){clearInterval(timer);timer=null;} }
function run(){
  if(!schedule.length){alert('ابتدا فرایند اضافه کنید.');return;}
  if(elapsed>=schedule[schedule.length-1].end) reset();
  if(timer)return;
  $('status').textContent='در حال اجرا';
  timer=setInterval(()=>{
    elapsed++;
    $('clock').textContent='زمان شبیه‌سازی: '+elapsed;
    const total=schedule[schedule.length-1].end;
    $('progressBar').style.width=(elapsed/total*100)+'%';
    document.querySelectorAll('.block[data-name]').forEach(b=>{
      const p=schedule.find(x=>x.name===b.dataset.name);
      b.classList.toggle('active',elapsed>p.start && elapsed<=p.end);
    });
    if(elapsed>=total){pause();$('status').textContent='پایان اجرا';}
  },650);
}
$('add').onclick=()=>{addProcess($('pname').value.trim(),Number($('arrival').value),Number($('burst').value));$('pname').value='P'+(processes.length+1);};
$('sample').onclick=()=>{processes=[{name:'P1',arrival:0,burst:5},{name:'P2',arrival:1,burst:3},{name:'P3',arrival:2,burst:8},{name:'P4',arrival:4,burst:2}];reset();render();};
$('clear').onclick=()=>{processes=[];reset();render();};
$('run').onclick=run;$('pause').onclick=()=>{pause();$('status').textContent='متوقف';};$('reset').onclick=reset;
$('sample').click();
