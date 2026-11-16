/* BB & Co Learn: question generators and step-by-step method explainers.
   All questions here are our own, written to the national curriculum objectives for each year group. */
(function(){
  var R=function(a,b){return a+Math.floor(Math.random()*(b-a+1))};
  var pick=function(arr){return arr[R(0,arr.length-1)]};
  var fmt=function(n){return Number(n).toLocaleString('en-GB')};
  var gcd=function(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t}return a};
  var lcm=function(a,b){return a/gcd(a,b)*b};
  var esc=function(s){return String(s).replace(/</g,'&lt;')};
  var fr=function(n,d){return "<span class='fr'><b>"+n+"</b><b>"+d+"</b></span>"};
  var mixedHTML=function(n,d){var w=Math.floor(n/d),r=n%d; if(r===0) return String(w); return (w?w:'')+fr(r,d)};

  /* ---------- layout helpers for the stepper views ---------- */
  function digits(n){return String(n).split('')}
  // rows: [{cells:[...], cls:'carry'|'line'|'ans'}], each cell {t:text, hl:bool, dim:bool}
  function grid(rows){
    return "<div class='sg'>"+rows.map(function(r){
      return "<div class='sgr "+(r.cls||'')+"'>"+r.cells.map(function(c){
        if(c==null) return "<span class='c e'></span>";
        if(typeof c!=='object') c={t:c};
        return "<span class='c"+(c.hl&&c.t!==''&&c.t!=null?' hl':'')+(c.dim?' dim':'')+(c.sm?' sm':'')+"'>"+(c.t===''||c.t==null?'':c.t)+"</span>";
      }).join('')+"</div>";
    }).join('')+"</div>";
  }
  function padL(arr,len,fill){while(arr.length<len)arr.unshift(fill===undefined?null:fill);return arr}

  /* ---------- steppers: each returns {title, steps:[{say, view}]} ---------- */
  var M={};

  M.colAdd=function(a,b){
    var A=digits(a),B=digits(b),w=Math.max(A.length,B.length)+1;
    A=padL(A,w);B=padL(B,w);
    var res=new Array(w).fill(null), carry=new Array(w).fill(null), steps=[];
    var names=['units','tens','hundreds','thousands','ten thousands','hundred thousands'];
    function view(hlCol,done){
      return grid([
        {cls:'carry',cells:carry.map(function(c,i){return c?{t:c,sm:true,hl:i===hlCol}:null})},
        {cells:A.map(function(d,i){return {t:d,hl:i===hlCol}})},
        {cells:B.map(function(d,i){return i===0?{t:'+'}:{t:d,hl:i===hlCol}})},
        {cls:'line',cells:new Array(w).fill('')},
        {cls:'ans',cells:res.map(function(d,i){return {t:d,hl:i===hlCol}})}
      ]);
    }
    steps.push({say:"Line the numbers up so the units sit under the units. We always start on the right.",view:view(-1)});
    var c=0;
    for(var i=w-1;i>=0;i--){
      var x=+(A[i]||0),y=+(B[i]||0),s=x+y+c,col=names[w-1-i]||'';
      if(i===0&&s===0){res[i]=null;break}
      var say=col.charAt(0).toUpperCase()+col.slice(1)+": "+x+(y||c?" + "+y:"")+(c?" + the "+c+" we carried":"")+" = "+s+".";
      if(s>=10){res[i]=s%10;c=1;if(i>0)carry[i-1]=1;say+=" That is more than 9, so write "+(s%10)+" and carry 1 to the next column.";}
      else{res[i]=s;c=0;say+=" Write "+s+".";}
      steps.push({say:say,view:view(i)});
    }
    steps.push({say:"Done: "+fmt(a)+" + "+fmt(b)+" = "+fmt(a+b)+".",view:view(-1)});
    return {title:"Column addition",steps:steps};
  };

  M.colSub=function(a,b){ // a >= b
    var A=digits(a).map(Number),B=padL(digits(b).map(Number),A.length,0),w=A.length,res=new Array(w).fill(null),steps=[];
    var work=A.slice(), changed=new Array(w).fill(false);
    function view(hl){
      return grid([
        {cls:'carry',cells:[null].concat(work.map(function(d,i){return changed[i]?{t:d,sm:true,hl:i===hl}:null}))},
        {cells:[null].concat(A.map(function(d,i){return {t:d,hl:i===hl,dim:changed[i]}}))},
        {cells:[{t:'−'}].concat(B.map(function(d,i){return {t:d,hl:i===hl}}))},
        {cls:'line',cells:new Array(w+1).fill('')},
        {cls:'ans',cells:[null].concat(res.map(function(d,i){return {t:d,hl:i===hl}}))}
      ]);
    }
    // we need a leading cell for the minus sign: shift everything right by one
    var shift=function(g){return g};
    steps.push({say:"Units under units, tens under tens. Start on the right and take the bottom digit away from the top one.",view:view(-1)});
    for(var i=w-1;i>=0;i--){
      var top=work[i],bot=B[i];
      if(top<bot){
        var j=i-1; while(j>=0&&work[j]===0){j--;}
        // exchange from j down to i
        var say=top+" take away "+bot+": we can't, "+top+" is too small. Exchange one from the next column: ";
        var before=top;
        for(var k=j;k<i;k++){ work[k]-=1; changed[k]=true; work[k+1]+=10; changed[k+1]=true; }
        say+=(j<i-1?"the next column is 0, so we go one further along: ":"")+"the "+before+" becomes "+work[i]+".";
        steps.push({say:say,view:view(i)});
        top=work[i];
      }
      res[i]=top-bot;
      steps.push({say:top+" take away "+bot+" = "+(top-bot)+". Write it down.",view:view(i)});
    }
    steps.push({say:"Done: "+fmt(a)+" − "+fmt(b)+" = "+fmt(a-b)+".",view:view(-1)});
    return {title:"Column subtraction",steps:steps};
  };

  M.shortMul=function(a,d){
    var A=digits(a).map(Number),w=A.length+1;A=padL(A,w,null);
    var res=new Array(w).fill(null),carry=new Array(w).fill(null),steps=[],c=0;
    function view(hl){return grid([
      {cells:A.map(function(x,i){return x==null?null:{t:x,hl:i===hl}})},
      {cells:padL([{t:'×'},{t:d,hl:hl>=0}],w,null)},
      {cls:'line',cells:new Array(w).fill('')},
      {cls:'ans',cells:res.map(function(x,i){return {t:x,hl:i===hl}})},
      {cls:'carry',cells:carry.map(function(x,i){return x?{t:x,sm:true,hl:i===hl}:null})}
    ])}
    steps.push({say:"Write the small number under the units. Multiply each digit by "+d+", starting on the right.",view:view(-1)});
    for(var i=w-1;i>=1;i--){
      var p=A[i]*d+c, say=A[i]+" × "+d+" = "+(A[i]*d)+(c?", plus the "+c+" carried makes "+p:"")+".";
      if(p>=10&&i>1){res[i]=p%10;c=Math.floor(p/10);carry[i-1]=c;say+=" Write "+(p%10)+", carry "+c+".";}
      else if(i===1){res[i]=p%10;if(p>=10){res[0]=Math.floor(p/10);}c=0;say+=" Write "+p+".";}
      else{res[i]=p;c=0;say+=" Write "+p+".";}
      steps.push({say:say,view:view(i)});
    }
    steps.push({say:"Done: "+fmt(a)+" × "+d+" = "+fmt(a*d)+".",view:view(-1)});
    return {title:"Short multiplication",steps:steps};
  };

  M.shortDiv=function(a,d){ // bus stop
    var A=digits(a).map(Number),w=A.length,q=new Array(w).fill(null),carry=new Array(w).fill(null),steps=[],r=0;
    function view(hl){return "<div class='bus-wrap'>"+grid([
      {cls:'ans',cells:[{t:''}].concat(q.map(function(x,i){return {t:x,hl:i===hl}}))},
      {cls:'busline',cells:[{t:d,hl:true}].concat(A.map(function(x,i){return {t:(carry[i]?"<small>"+carry[i]+"</small>":"")+x,hl:i===hl}}))}
    ])+"</div>"}
    steps.push({say:"Bus stop: "+d+" waits outside, "+fmt(a)+" sits inside. Work from the left.",view:view(-1)});
    for(var i=0;i<w;i++){
      var cur=r*10+A[i], qd=Math.floor(cur/d), rem=cur%d;
      var say="How many "+d+"s in "+cur+"? "+qd+(qd?" ("+qd+" × "+d+" = "+(qd*d)+")":"")+".";
      if(rem&&i<w-1){say+=" "+rem+" left over, so carry it to the next digit to make "+(rem*10+A[i+1])+".";carry[i+1]=rem;}
      else if(rem){say+=" "+rem+" left over at the end: that is the remainder.";}
      if(i===0&&qd===0){say="How many "+d+"s in "+cur+"? None, so carry the "+cur+" across to make "+(cur*10+A[1])+".";q[i]=null;}
      else q[i]=qd;
      r=rem;steps.push({say:say,view:view(i)});
    }
    var ans=Math.floor(a/d);
    steps.push({say:"Done: "+fmt(a)+" ÷ "+d+" = "+fmt(ans)+(r?" remainder "+r:"")+".",view:view(-1)});
    return {title:"Short division (bus stop)",steps:steps};
  };

  M.longMul=function(a,b){ // b two-digit
    var u=b%10,t=Math.floor(b/10),r1=a*u,r2=a*t*10,tot=r1+r2;
    var w=String(tot).length+1;
    function row(n,hl,lab){var cells=padL(digits(n).map(function(x){return {t:x,hl:hl}}),w,null);return {cells:cells,lab:lab}}
    var steps=[],blank=new Array(w).fill(null);
    function view(s){return grid([
      row(a,s===0), {cells:padL([{t:'×'}].concat(digits(b).map(function(x,i){return {t:x,hl:(s===1&&i===1)||(s===2&&i===0)}})),w,null)},
      {cls:'line',cells:new Array(w).fill('')},
      s>=1?row(r1,s===1):{cells:blank},
      s>=2?row(r2,s===2):{cells:blank},
      s>=3?{cls:'line',cells:new Array(w).fill('')}:{cells:blank},
      s>=3?Object.assign(row(tot,s===3),{cls:'ans'}):{cells:blank}
    ])}
    steps.push({say:"Long multiplication has two rows. First multiply by the units digit, then by the tens digit, then add the rows.",view:view(0)});
    steps.push({say:"Row 1: "+fmt(a)+" × "+u+" (the units) = "+fmt(r1)+".",view:view(1)});
    steps.push({say:"Row 2: we are multiplying by "+t+" tens, so write a 0 first, then "+fmt(a)+" × "+t+" = "+fmt(a*t)+". The row reads "+fmt(r2)+".",view:view(2)});
    steps.push({say:"Add the two rows: "+fmt(r1)+" + "+fmt(r2)+" = "+fmt(tot)+". The zero is the step most people forget: it is worth a whole mark.",view:view(3)});
    return {title:"Long multiplication",steps:steps};
  };

  M.longDiv=function(a,d){ // d two-digit, bring-down method
    var A=digits(a).map(Number),steps=[],cur=0,q='',lines=[];
    var w=A.length+1;
    function view(hlPos){
      var rows=[{cls:'ans',cells:[{t:''}].concat(padL(q.split('').map(function(x){return {t:x}}),A.length,null).map(function(c,i){return c&&i===hlPos?{t:c.t,hl:true}:c}))},
                {cls:'busline',cells:[{t:d,hl:true}].concat(A.map(function(x,i){return {t:x,hl:i===hlPos}}))}];
      lines.forEach(function(l){var cells=padL(digits(l.v).map(function(x){return {t:x,hl:l.hl}}),l.pos+1,null);while(cells.length<A.length)cells.push(null);rows.push({cells:[{t:l.op||''}].concat(cells),cls:l.cls||''})});
      return "<div class='bus-wrap'>"+grid(rows)+"</div>";
    }
    steps.push({say:"Long division: bring digits down one at a time. Each time ask how many "+d+"s fit, write that on top, take away, and bring the next digit down.",view:view(-1)});
    for(var i=0;i<A.length;i++){
      cur=cur*10+A[i];
      var qd=Math.floor(cur/d);
      if(q===''&&qd===0){steps.push({say:"How many "+d+"s in "+cur+"? None yet. Bring down the next digit.",view:view(i)});continue;}
      q+=qd;
      lines.forEach(function(l){l.hl=false});
      var say="How many "+d+"s in "+cur+"? "+qd+", because "+qd+" × "+d+" = "+(qd*d)+". Write "+qd+" on top and take "+(qd*d)+" away from "+cur+": "+(cur-qd*d)+" left.";
      lines.push({v:qd*d,op:'−',hl:true,pos:i}); lines.push({v:cur-qd*d,cls:'res',hl:true,pos:i});
      cur=cur-qd*d;
      if(i<A.length-1) say+=" Bring down the "+A[i+1]+".";
      steps.push({say:say,view:view(i)});
    }
    steps.push({say:"Done: "+fmt(a)+" ÷ "+d+" = "+fmt(Math.floor(a/d))+(cur?" remainder "+cur:"")+".",view:view(-1)});
    return {title:"Long division",steps:steps};
  };

  M.pow10=function(a,op,k){ // op '×' or '÷', k = 10,100,1000
    var places=String(k).length-1, ans=op==='×'?a*k:a/k, steps=[];
    var cols=['thousands','hundreds','tens','units','tenths','hundredths','thousandths'];
    function place(n){ // returns map col->digit
      var s=Number(n).toFixed(3).replace(/\.?0+$/,''); var parts=s.split('.'),ip=parts[0],dp=parts[1]||'';
      var m={}; ip.split('').reverse().forEach(function(d,i){m[['units','tens','hundreds','thousands'][i]]=d}); dp.split('').forEach(function(d,i){m[['tenths','hundredths','thousandths'][i]]=d}); return m;
    }
    function view(n,hl){var m=place(n);return "<table class='pv'><tr>"+cols.map(function(c){return "<th>"+c.replace('thousands','Th').replace('hundreds','H').replace('tens','T').replace('units','U').replace('tenths','t').replace('hundredths','h').replace('thousandths','th')+"</th>"}).join('')+"</tr><tr>"+cols.map(function(c){return "<td class='"+(hl&&m[c]!=null?'hl':'')+"'>"+(m[c]!=null?m[c]:'')+"</td>"}).join('')+"</tr></table>"}
    steps.push({say:"Put "+fmt(a)+" in a place value chart. The decimal point never moves: the digits do.",view:view(a,false)});
    steps.push({say:(op==='×'?"Multiplying":"Dividing")+" by "+fmt(k)+" moves every digit "+places+" place"+(places>1?"s":"")+" to the "+(op==='×'?"left (bigger)":"right (smaller)")+". Fill empty columns with 0.",view:view(ans,true)});
    steps.push({say:"Done: "+fmt(a)+" "+op+" "+fmt(k)+" = "+fmt(ans)+".",view:view(ans,false)});
    return {title:(op==='×'?"Multiplying":"Dividing")+" by "+fmt(k),steps:steps};
  };

  M.fracOf=function(n,d,amt){
    var part=amt/d, steps=[];
    function view(s){return "<div class='bars'>"+Array.apply(null,{length:d}).map(function(_,i){return "<span class='bar"+(s>=1?' split':'')+(s>=2&&i<n?' hl':'')+"'>"+(s>=1?part:'')+"</span>"}).join('')+"<p class='cap'>"+fmt(amt)+"</p></div>"}
    steps.push({say:"We want "+n+"/"+d+" of "+fmt(amt)+". Think of "+fmt(amt)+" as a bar.",view:view(0)});
    steps.push({say:"The bottom number ("+d+") says how many equal parts: "+fmt(amt)+" ÷ "+d+" = "+fmt(part)+" in each part.",view:view(1)});
    steps.push({say:"The top number ("+n+") says how many parts we take: "+n+" × "+fmt(part)+" = "+fmt(n*part)+".",view:view(2)});
    steps.push({say:"Done: "+n+"/"+d+" of "+fmt(amt)+" = "+fmt(n*part)+". Divide by the bottom, multiply by the top.",view:view(2)});
    return {title:"Fraction of an amount",steps:steps};
  };

  M.percentOf=function(p,amt){
    var steps=[],ten=amt/10,five=amt/20,one=amt/100,tens=Math.floor(p/10),rem=p%10,hasFive=rem>=5,ones=rem%5,total=0,rows=[];
    function view(){return "<table class='pct'>"+rows.map(function(r){return "<tr><td>"+r[0]+"</td><td>"+r[1]+"</td></tr>"}).join('')+"</table>"}
    steps.push({say:"Percent means out of 100. Build "+p+"% from easy pieces: 10%, 5% and 1%.",view:view()});
    rows.push(["10% of "+fmt(amt),fmt(ten)+" (divide by 10)"]);
    steps.push({say:"10% of "+fmt(amt)+" is "+fmt(amt)+" ÷ 10 = "+fmt(ten)+".",view:view()});
    if(tens>1){rows.push([tens*10+"%",fmt(ten)+" × "+tens+" = "+fmt(ten*tens)]);steps.push({say:tens*10+"% is "+tens+" lots of 10%: "+fmt(ten)+" × "+tens+" = "+fmt(ten*tens)+".",view:view()});}
    total+=ten*tens;
    if(hasFive){rows.push(["5%","half of 10% = "+fmt(five)]);steps.push({say:"5% is half of 10%: "+fmt(five)+".",view:view()});total+=five;}
    if(ones){rows.push([ones+"%","1% is "+fmt(one)+", so "+ones+"% = "+fmt(one*ones)]);steps.push({say:"1% is "+fmt(amt)+" ÷ 100 = "+fmt(one)+". "+ones+"% = "+fmt(one*ones)+".",view:view()});total+=one*ones;}
    var parts=[];if(tens)parts.push(tens*10+"%");if(hasFive)parts.push("5%");if(ones)parts.push(ones+"%");
    rows.push(["<b>"+p+"%</b>","<b>"+fmt(total)+"</b>"]);
    steps.push({say:"Add the pieces ("+parts.join(" + ")+"): "+p+"% of "+fmt(amt)+" = "+fmt(total)+".",view:view()});
    return {title:"Percentage of an amount",steps:steps};
  };

  M.addFrac=function(n1,d1,n2,d2,op){
    op=op||'+'; var L=lcm(d1,d2),a=n1*L/d1,b=n2*L/d2,s=op==='+'?a+b:a-b,g=gcd(s,L),steps=[];
    var eq="<div class='bigeq'>"+fr(n1,d1)+" "+op+" "+fr(n2,d2)+"</div>";
    steps.push({say:"We can only "+(op==='+'?"add":"subtract")+" fractions when the bottom numbers (denominators) match.",view:eq});
    if(d1!==d2){
      steps.push({say:"Find a number both "+d1+" and "+d2+" go into: "+L+". Change each fraction to have "+L+" on the bottom. Whatever you do to the bottom, do to the top.",view:"<div class='bigeq'>"+fr(n1,d1)+" = "+fr(a,L)+"  &nbsp;and&nbsp;  "+fr(n2,d2)+" = "+fr(b,L)+"</div>"});
    }
    steps.push({say:"Now "+(op==='+'?"add":"subtract")+" the tops and keep the bottom: "+a+" "+op+" "+b+" = "+s+".",view:"<div class='bigeq'>"+fr(a,L)+" "+op+" "+fr(b,L)+" = "+fr(s,L)+"</div>"});
    if(g>1||s>=L){
      var fin=(g>1?fr(s/g,L/g):"")+(s/g>=L/g?" = "+mixedHTML(s/g,L/g):"");
      steps.push({say:(g>1?"Simplify by dividing top and bottom by "+g+". ":"")+(s>=L?"The top is bigger than the bottom, so it can be written as a mixed number.":""),view:"<div class='bigeq'>"+fr(s,L)+" = "+fin+"</div>"});
    }
    return {title:(op==='+'?"Adding":"Subtracting")+" fractions",steps:steps};
  };

  M.bidmas=function(expr,order){ // order: array of {show, say}
    var steps=[{say:"BIDMAS tells us the order: Brackets, Indices (powers), Division and Multiplication, Addition and Subtraction.",view:"<div class='bigeq'>"+expr+"</div>"}];
    order.forEach(function(o){steps.push({say:o.say,view:"<div class='bigeq'>"+o.show+"</div>"})});
    return {title:"Order of operations",steps:steps};
  };

  M.partition=function(n){
    var D=digits(n).map(Number),w=D.length,vals=D.map(function(d,i){return d*Math.pow(10,w-1-i)}),names=['units','tens','hundreds','thousands','ten thousands'].slice(0,w).reverse();
    var steps=[{say:"Every digit has a value that depends on its column.",view:grid([{cells:D.map(function(d){return {t:d}})}])}];
    D.forEach(function(d,i){steps.push({say:"The "+d+" is in the "+names[i]+" column, so it is worth "+fmt(vals[i])+".",view:grid([{cells:D.map(function(x,j){return {t:x,hl:j===i}})},{cls:'ans',cells:D.map(function(x,j){return j===i?{t:fmt(vals[j]),hl:true}:null})}])})});
    steps.push({say:fmt(n)+" = "+vals.filter(function(v){return v}).map(fmt).join(" + ")+".",view:"<div class='bigeq'>"+vals.filter(function(v){return v}).map(fmt).join(" + ")+"</div>"});
    return {title:"Place value",steps:steps};
  };

  M.times=function(a,b){ // tables tricks
    var steps=[],big=Math.max(a,b),small=Math.min(a,b);
    var dots=function(rows,cols,hl){var h="<div class='array'>";for(var r=0;r<rows;r++){h+="<div>";for(var c=0;c<cols;c++)h+="<i class='"+(hl&&r<hl?'hl':'')+"'></i>";h+="</div>"}return h+"</div>"};
    if(small===9||big===9){var o=small===9?big:small;steps.push({say:"Trick for 9s: do 10 × "+o+" = "+(10*o)+", then take one "+o+" away.",view:"<div class='bigeq'>10 × "+o+" = "+(10*o)+"</div>"});steps.push({say:(10*o)+" − "+o+" = "+(9*o)+". So 9 × "+o+" = "+(9*o)+".",view:"<div class='bigeq'>"+(10*o)+" − "+o+" = "+(9*o)+"</div>"});}
    else if(small===4||big===4){var o4=small===4?big:small;steps.push({say:"Trick for 4s: double, then double again. Double "+o4+" is "+(2*o4)+".",view:"<div class='bigeq'>"+o4+" → "+(2*o4)+"</div>"});steps.push({say:"Double "+(2*o4)+" is "+(4*o4)+". So 4 × "+o4+" = "+(4*o4)+".",view:"<div class='bigeq'>"+(2*o4)+" → "+(4*o4)+"</div>"});}
    else if(small===8||big===8){var o8=small===8?big:small;steps.push({say:"Trick for 8s: double three times. "+o8+" → "+(2*o8)+" → "+(4*o8)+" → "+(8*o8)+".",view:"<div class='bigeq'>"+o8+" → "+(2*o8)+" → "+(4*o8)+" → "+(8*o8)+"</div>"});}
    else if(small===5||big===5){var o5=small===5?big:small;steps.push({say:"Trick for 5s: times 10, then halve. 10 × "+o5+" = "+(10*o5)+", half of that is "+(5*o5)+".",view:"<div class='bigeq'>"+(10*o5)+" ÷ 2 = "+(5*o5)+"</div>"});}
    else if(small===11||big===11){var o11=small===11?big:small;steps.push({say:"Trick for 11s: 10 × "+o11+" = "+(10*o11)+", then add one more "+o11+": "+(11*o11)+".",view:"<div class='bigeq'>"+(10*o11)+" + "+o11+" = "+(11*o11)+"</div>"});}
    else if(small===3){steps.push({say:"3 × "+big+": double "+big+" ("+(2*big)+") and add one more "+big+".",view:"<div class='bigeq'>"+(2*big)+" + "+big+" = "+(3*big)+"</div>"});}
    else if(small===6){steps.push({say:"6 × "+big+": do 5 × "+big+" = "+(5*big)+" then add one more "+big+".",view:"<div class='bigeq'>"+(5*big)+" + "+big+" = "+(6*big)+"</div>"});}
    else if(small===12){steps.push({say:"12 × "+big+": 10 × "+big+" = "+(10*big)+" plus 2 × "+big+" = "+(2*big)+".",view:"<div class='bigeq'>"+(10*big)+" + "+(2*big)+" = "+(12*big)+"</div>"});}
    else if(small===7){steps.push({say:"7 × "+big+": 5 × "+big+" = "+(5*big)+" plus 2 × "+big+" = "+(2*big)+".",view:"<div class='bigeq'>"+(5*big)+" + "+(2*big)+" = "+(7*big)+"</div>"});}
    else steps.push({say:"Count in "+big+"s, "+small+" times: "+Array.apply(null,{length:small}).map(function(_,i){return big*(i+1)}).join(", ")+".",view:"<div class='bigeq'>"+a+" × "+b+" = "+(a*b)+"</div>"});
    steps.push({say:"Picture it as an array: "+small+" rows of "+big+" makes "+(a*b)+".",view:dots(small,big,small)});
    steps.push({say:"So "+a+" × "+b+" = "+(a*b)+". And the other way round is the same: "+b+" × "+a+" = "+(a*b)+".",view:"<div class='bigeq'>"+a+" × "+b+" = "+(a*b)+"</div>"});
    return {title:"Times tables",steps:steps};
  };

  M.divFact=function(a,d){ // a = d * q
    var q=a/d;
    return {title:"Division from times tables",steps:[
      {say:"Division is the opposite of multiplying. "+a+" ÷ "+d+" asks: "+d+" times what makes "+a+"?",view:"<div class='bigeq'>"+d+" × ? = "+a+"</div>"},
      {say:"Go through the "+d+" times table: "+Array.apply(null,{length:q}).map(function(_,i){return d*(i+1)}).join(", ")+". We land on "+a+" at "+q+".",view:"<div class='bigeq'>"+d+" × "+q+" = "+a+"</div>"},
      {say:"So "+a+" ÷ "+d+" = "+q+".",view:"<div class='bigeq'>"+a+" ÷ "+d+" = "+q+"</div>"}]};
  };

  M.square=function(n){return {title:"Square numbers",steps:[
    {say:n+"² means "+n+" × "+n+", a square with "+n+" rows of "+n+".",view:"<div class='array'>"+Array.apply(null,{length:n}).map(function(){return "<div>"+Array.apply(null,{length:n}).map(function(){return "<i class='hl'></i>"}).join('')+"</div>"}).join('')+"</div>"},
    {say:n+" × "+n+" = "+(n*n)+". The little 2 is not 'times 2'.",view:"<div class='bigeq'>"+n+"² = "+(n*n)+"</div>"}]}};

  M.mulFrac=function(n,d,k){ var s=n*k,g=gcd(s,d); return {title:"Fraction times a whole number",steps:[
    {say:"Multiply the top by the whole number. The bottom stays the same.",view:"<div class='bigeq'>"+fr(n,d)+" × "+k+" = "+fr(n*k,d)+"</div>"},
    {say:(g>1?"Simplify by dividing top and bottom by "+g+". ":"")+"Write it as a mixed number if the top is bigger than the bottom.",view:"<div class='bigeq'>"+fr(s,d)+" = "+(g>1?fr(s/g,d/g)+" = ":"")+mixedHTML(s/g,d/g)+"</div>"}]}};
  M.divFrac=function(n,d,k){ return {title:"Fraction divided by a whole number",steps:[
    {say:"Dividing by "+k+" makes "+k+" times as many pieces, so multiply the bottom by "+k+".",view:"<div class='bigeq'>"+fr(n,d)+" ÷ "+k+" = "+fr(n,d*k)+"</div>"},
    {say:"Simplify if you can. "+fr(n,d*k)+(gcd(n,d*k)>1?" = "+fr(n/gcd(n,d*k),d*k/gcd(n,d*k)):" is already in its simplest form")+".",view:"<div class='bigeq'>"+fr(n/gcd(n,d*k),d*k/gcd(n,d*k))+"</div>"}]}};
  M.decAdd=function(a,b,op){ var A=a.toFixed(2),B=b.toFixed(2),res=op==='+'?a+b:a-b; return {title:"Decimals in columns",steps:[
    {say:"Line up the decimal points. Add zeros so both numbers have the same number of decimal places.",view:"<div class='bigeq'>"+A+" "+op+" "+B+"</div>"},
    {say:"Now it is ordinary column "+(op==='+'?"addition":"subtraction")+". Put the decimal point in the answer directly underneath.",view:"<div class='bigeq'>"+A+" "+op+" "+B+" = "+res.toFixed(2).replace(/\.?0+$/,'')+"</div>"}]}};

  /* ---------- question generators per topic ---------- */
  // each returns {q (HTML), a (canonical), m:[method, args...], fraction?}
  var G={};
  G.add3=function(){var a=R(123,876),b=R(100,999-a);if(R(0,1))b=R(100,999-a);return {q:fmt(a)+" + "+fmt(b)+" =",a:String(a+b),m:['colAdd',a,b]}};
  G.sub3=function(){var a=R(300,999),b=R(100,a-50);return {q:a+" − "+b+" =",a:String(a-b),m:['colSub',a,b]}};
  G.add4=function(){var a=R(1234,8765),b=R(1000,9999-a);return {q:fmt(a)+" + "+fmt(b)+" =",a:String(a+b),m:['colAdd',a,b]}};
  G.sub4=function(){var a=R(3000,9999),b=R(1000,a-500);return {q:fmt(a)+" − "+fmt(b)+" =",a:String(a-b),m:['colSub',a,b]}};
  G.addBig=function(){var a=R(12345,876543),b=R(10000,999999-a);return {q:fmt(a)+" + "+fmt(b)+" =",a:String(a+b),m:['colAdd',a,b]}};
  G.subBig=function(){var a=R(100000,999999),b=R(10000,a-5000);return {q:fmt(a)+" − "+fmt(b)+" =",a:String(a-b),m:['colSub',a,b]}};
  G.tablesEasy=function(){var t=pick([2,5,10]),k=R(2,12);return R(0,1)?{q:t+" × "+k+" =",a:String(t*k),m:['times',t,k]}:{q:k+" × "+t+" =",a:String(t*k),m:['times',k,t]}};
  G.tables348=function(){var t=pick([3,4,8]),k=R(2,12);return R(0,1)?{q:t+" × "+k+" =",a:String(t*k),m:['times',t,k]}:{q:k+" × "+t+" =",a:String(t*k),m:['times',k,t]}};
  G.tablesAll=function(){var t=R(2,12),k=R(2,12);return {q:t+" × "+k+" =",a:String(t*k),m:['times',t,k]}};
  G.divEasy=function(){var t=pick([2,3,4,5,8,10]),k=R(2,12);return {q:(t*k)+" ÷ "+t+" =",a:String(k),m:['divFact',t*k,t]}};
  G.divAll=function(){var t=R(2,12),k=R(2,12);return {q:(t*k)+" ÷ "+t+" =",a:String(k),m:['divFact',t*k,t]}};
  G.missing=function(){var t=R(2,12),k=R(2,12);return R(0,1)?{q:t+" × <span class='blank'></span> = "+(t*k),a:String(k),m:['divFact',t*k,t]}:{q:(t*k)+" ÷ <span class='blank'></span> = "+k,a:String(t),m:['divFact',t*k,k]}};
  G.unitFrac=function(){var d=pick([2,3,4,5,10]),amt=d*R(2,12);return {q:fr(1,d)+" of "+amt+" =",a:String(amt/d),m:['fracOf',1,d,amt]}};
  G.fracOfAmt=function(){var d=pick([3,4,5,6,8,10]),n=R(2,d-1),amt=d*R(3,15);return {q:fr(n,d)+" of "+amt+" =",a:String(amt/d*n),m:['fracOf',n,d,amt]}};
  G.fracOfBig=function(){var d=pick([4,5,8,10,12]),n=R(2,d-1),amt=d*R(20,90);return {q:fr(n,d)+" of "+fmt(amt)+" =",a:String(amt/d*n),m:['fracOf',n,d,amt]}};
  G.part3=function(){var n=R(101,999),v=digits(n).map(Number),w=3,which=R(0,2),vals=v.map(function(d,i){return d*Math.pow(10,w-1-i)});if(vals[which]===0)which=0;return {q:n+" = "+vals.map(function(x,i){return i===which?"<span class='blank'></span>":x}).join(" + "),a:String(vals[which]),m:['partition',n]}};
  G.part4=function(){var n=R(1001,9999),v=digits(n).map(Number),w=4,which=R(0,3),vals=v.map(function(d,i){return d*Math.pow(10,w-1-i)});if(vals[which]===0)which=0;return {q:fmt(n)+" = "+vals.map(function(x,i){return i===which?"<span class='blank'></span>":fmt(x)}).join(" + "),a:String(vals[which]),m:['partition',n]}};
  G.shortMul3=function(){var a=R(112,987),d=R(3,9);return {q:a+" × "+d+" =",a:String(a*d),m:['shortMul',a,d]}};
  G.shortMul2=function(){var a=R(13,98),d=R(3,9);return {q:a+" × "+d+" =",a:String(a*d),m:['shortMul',a,d]}};
  G.shortDivRem=function(){var d=R(3,9),q=R(11,30),r=R(1,d-1),a=q*d+r;return {q:a+" ÷ "+d+" = <small>(write the remainder as r, e.g. 7 r 2)</small>",a:q+" r "+r,rem:true,m:['shortDiv',a,d]}};
  G.shortDivExact=function(){var d=R(3,9),q=R(21,99),a=q*d;return {q:a+" ÷ "+d+" =",a:String(q),m:['shortDiv',a,d]}};
  G.shortDiv4=function(){var d=R(3,9),q=R(120,999),a=q*d;return {q:fmt(a)+" ÷ "+d+" =",a:String(q),m:['shortDiv',a,d]}};
  G.pow10whole=function(){var a=R(12,987),k=pick([10,100]),op=pick(['×','÷']);if(op==='÷'){a=a*k;}return {q:fmt(a)+" "+op+" "+k+" =",a:String(op==='×'?a*k:a/k),m:['pow10',a,op,k]}};
  G.pow10dec=function(){var a=(R(12,999)/pick([10,100])),k=pick([10,100,1000]),op=pick(['×','÷']);var ans=op==='×'?a*k:a/k;ans=+ans.toFixed(4);return {q:a+" "+op+" "+fmt(k)+" =",a:String(ans),m:['pow10',a,op,k]}};
  G.longMul3x2=function(){var a=R(123,987),b=R(12,89);return {q:"<span class='col'><span>"+a+"</span><span>× "+b+"</span></span>",a:String(a*b),m:['longMul',a,b],plain:a+" × "+b+" ="}};
  G.longMul4x2=function(){var a=R(1234,9876),b=R(12,98);return {q:"<span class='col'><span>"+fmt(a)+"</span><span>× "+b+"</span></span>",a:String(a*b),m:['longMul',a,b],plain:fmt(a)+" × "+b+" ="}};
  G.longDiv=function(){var d=R(12,45),q=R(21,199),a=q*d;return {q:"<span class='bus'><span class='dv'>"+d+"</span><span class='dd'>"+fmt(a)+"</span></span>",a:String(q),m:['longDiv',a,d],plain:fmt(a)+" ÷ "+d+" ="}};
  G.square=function(){var n=R(2,12);return {q:n+"<sup>2</sup> =",a:String(n*n),m:['square',n]}};
  G.addFracSame=function(){var d=pick([5,6,7,8,9,10,12]),a=R(1,d-2),b=R(1,d-1-a);return {q:fr(a,d)+" + "+fr(b,d)+" =",a:(a+b)+"/"+d,fraction:true,m:['addFrac',a,d,b,d,'+']}};
  G.subFracSame=function(){var d=pick([5,6,7,8,9,10,12]),a=R(2,d-1),b=R(1,a-1);return {q:fr(a,d)+" − "+fr(b,d)+" =",a:(a-b)+"/"+d,fraction:true,m:['addFrac',a,d,b,d,'−']}};
  G.addFracRelated=function(){var d=pick([4,6,8,10,12]),d1=pick([2,d/2].filter(function(x){return x>1&&Number.isInteger(x)&&x!==d})),a=R(1,d1-1),b=R(1,d-1);return {q:fr(a,d1)+" + "+fr(b,d)+" =",a:(a*d/d1+b)+"/"+d,fraction:true,m:['addFrac',a,d1,b,d,'+']}};
  G.addFracAny=function(){var pairs=[[3,4],[2,5],[3,5],[4,5],[2,7],[3,7],[5,6],[3,8],[5,8],[2,9],[4,9]],p=pick(pairs),d1=p[0],d2=p[1],a=R(1,d1-1),b=R(1,d2-1),op=pick(['+','−']);if(op==='−'&&a/d1<b/d2){var t=a;a=b;b=t;t=d1;d1=d2;d2=t;}var L=lcm(d1,d2),s=op==='+'?a*L/d1+b*L/d2:a*L/d1-b*L/d2;return {q:fr(a,d1)+" "+op+" "+fr(b,d2)+" =",a:s+"/"+L,fraction:true,m:['addFrac',a,d1,b,d2,op]}};
  G.mixedAdd=function(){var d=pick([3,4,5,6,8]),w1=R(1,4),w2=R(1,3),a=R(1,d-1),b=R(1,d-1),n1=w1*d+a,n2=w2*d+b;return {q:w1+fr(a,d)+" + "+w2+fr(b,d)+" =",a:(n1+n2)+"/"+d,fraction:true,m:['addFrac',n1,d,n2,d,'+']}};
  G.mulFrac=function(){var d=pick([3,4,5,6,8]),n=R(1,d-1),k=R(2,12);return {q:fr(n,d)+" × "+k+" =",a:(n*k)+"/"+d,fraction:true,m:['mulFrac',n,d,k]}};
  G.divFrac=function(){var d=pick([3,4,5,6,8]),n=R(1,d-1),k=R(2,6);return {q:fr(n,d)+" ÷ "+k+" =",a:n+"/"+(d*k),fraction:true,m:['divFrac',n,d,k]}};
  G.pctEasy=function(){var p=pick([10,50,25,20]),amt=pick([40,60,80,120,200,240,300,400,500,800]);return {q:p+"% of "+fmt(amt)+" =",a:String(amt*p/100),m:['percentOf',p,amt]}};
  G.pctAny=function(){var p=pick([5,15,30,35,45,60,65,70,85,95,12,18,23,31,47,19,65]),amt=pick([200,300,400,500,600,800,1200,1500,2000,2300,2400,3000]);return {q:p+"% of "+fmt(amt)+" =",a:String(amt*p/100),m:['percentOf',p,amt]}};
  G.bidmas=function(){
    var t=R(0,3),a,b,c,d,q,ans,steps;
    if(t===0){a=R(2,9);b=R(2,9);c=R(2,9);q=a+" + "+b+" × "+c;ans=a+b*c;steps=[{show:a+" + <mark>"+(b*c)+"</mark>",say:"Multiplication first: "+b+" × "+c+" = "+(b*c)+"."},{show:"<mark>"+ans+"</mark>",say:"Then add: "+a+" + "+(b*c)+" = "+ans+"."}];}
    else if(t===1){a=R(2,9);b=R(2,9);c=R(2,9);q="("+a+" + "+b+") × "+c;ans=(a+b)*c;steps=[{show:"<mark>"+(a+b)+"</mark> × "+c,say:"Brackets first: "+a+" + "+b+" = "+(a+b)+"."},{show:"<mark>"+ans+"</mark>",say:"Then multiply: "+(a+b)+" × "+c+" = "+ans+"."}];}
    else if(t===2){a=R(2,9);b=R(2,9);c=R(2,6);d=c*R(2,5);q=a+"<sup>2</sup> + "+b+" − "+d+" ÷ "+c;ans=a*a+b-d/c;steps=[{show:"<mark>"+(a*a)+"</mark> + "+b+" − "+d+" ÷ "+c,say:"Indices first: "+a+"² = "+(a*a)+"."},{show:(a*a)+" + "+b+" − <mark>"+(d/c)+"</mark>",say:"Division next: "+d+" ÷ "+c+" = "+(d/c)+"."},{show:"<mark>"+ans+"</mark>",say:"Then left to right: "+(a*a)+" + "+b+" − "+(d/c)+" = "+ans+"."}];}
    else {a=R(20,60);b=R(2,9);c=R(2,9);q=a+" − "+b+" × "+c;ans=a-b*c;if(ans<0){a=a+b*c;q=a+" − "+b+" × "+c;ans=a-b*c;}steps=[{show:a+" − <mark>"+(b*c)+"</mark>",say:"Multiplication before subtraction: "+b+" × "+c+" = "+(b*c)+"."},{show:"<mark>"+ans+"</mark>",say:a+" − "+(b*c)+" = "+ans+"."}];}
    return {q:q+" =",a:String(ans),m:['bidmas',q,steps]};
  };
  G.decAddSub=function(){var a=R(100,999)/10,b=R(10,99)/10,op=pick(['+','−']);if(op==='−'&&b>a){var t=a;a=b;b=t;}var ans=op==='+'?a+b:a-b;return {q:a+" "+op+" "+b+" =",a:String(+ans.toFixed(2)),m:['decAdd',a,b,op]}};
  G.decAdd3=function(){var a=R(1000,9999)/100,b=R(1000,99999)/1000,ans=+(a+b).toFixed(3);return {q:a+" + "+b+" =",a:String(ans),m:['decAdd',a,b,'+']}};
  G.mulDec=function(){var a=R(2,9),b=R(11,99)/10;return {q:a+" × "+b+" =",a:String(+(a*b).toFixed(1)),m:['shortMul',Math.round(b*10),a]}};

  /* ---------- the ladder ---------- */
  var LADDER=[
    {year:"Year 3",key:"y3",blurb:"Numbers to 1,000, the first times tables and simple fractions.",topics:[
      {id:"y3-pv",name:"Place value",gen:["part3"],emoji:"🔢"},
      {id:"y3-add",name:"Column addition",gen:["add3"],emoji:"➕"},
      {id:"y3-sub",name:"Column subtraction",gen:["sub3"],emoji:"➖"},
      {id:"y3-t1",name:"2, 5 and 10 times tables",gen:["tablesEasy"],emoji:"✖️"},
      {id:"y3-t2",name:"3, 4 and 8 times tables",gen:["tables348"],emoji:"✖️"},
      {id:"y3-div",name:"Sharing: division facts",gen:["divEasy"],emoji:"➗"},
      {id:"y3-frac",name:"A fraction of an amount",gen:["unitFrac"],emoji:"🍕"}]},
    {year:"Year 4",key:"y4",blurb:"Four-digit numbers, every times table to 12, remainders and tenths.",topics:[
      {id:"y4-pv",name:"Place value to 10,000",gen:["part4"],emoji:"🔢"},
      {id:"y4-add",name:"Adding 4-digit numbers",gen:["add4"],emoji:"➕"},
      {id:"y4-sub",name:"Subtracting 4-digit numbers",gen:["sub4"],emoji:"➖"},
      {id:"y4-t",name:"All the times tables",gen:["tablesAll","missing"],emoji:"✖️"},
      {id:"y4-div",name:"Division facts",gen:["divAll"],emoji:"➗"},
      {id:"y4-sm",name:"Short multiplication",gen:["shortMul2","shortMul3"],emoji:"📝"},
      {id:"y4-sd",name:"Division with remainders",gen:["shortDivRem"],emoji:"🚌"},
      {id:"y4-p10",name:"Times and divide by 10 and 100",gen:["pow10whole"],emoji:"↔️"},
      {id:"y4-frac",name:"Fractions of amounts",gen:["fracOfAmt"],emoji:"🍕"},
      {id:"y4-af",name:"Adding fractions (same bottom)",gen:["addFracSame","subFracSame"],emoji:"🧩"}]},
    {year:"Year 5",key:"y5",blurb:"Big numbers, long multiplication, bus stop division, percentages begin.",topics:[
      {id:"y5-add",name:"Adding big numbers",gen:["addBig"],emoji:"➕"},
      {id:"y5-sub",name:"Subtracting big numbers",gen:["subBig"],emoji:"➖"},
      {id:"y5-lm",name:"Long multiplication",gen:["longMul3x2"],emoji:"📝"},
      {id:"y5-sd",name:"Bus stop division",gen:["shortDivExact","shortDiv4"],emoji:"🚌"},
      {id:"y5-p10",name:"Decimals times and divide by 10, 100, 1,000",gen:["pow10dec"],emoji:"↔️"},
      {id:"y5-sq",name:"Square numbers",gen:["square"],emoji:"⬛"},
      {id:"y5-dec",name:"Adding and subtracting decimals",gen:["decAddSub"],emoji:"🔸"},
      {id:"y5-af",name:"Fractions with related bottoms",gen:["addFracRelated","mixedAdd"],emoji:"🧩"},
      {id:"y5-frac",name:"Fractions of bigger amounts",gen:["fracOfBig"],emoji:"🍕"},
      {id:"y5-pct",name:"Easy percentages",gen:["pctEasy"],emoji:"💯"}]},
    {year:"Year 6",key:"y6",blurb:"Everything the arithmetic paper asks. Clear these and sit the real thing.",topics:[
      {id:"y6-lm",name:"Long multiplication (4 by 2)",gen:["longMul4x2"],emoji:"📝"},
      {id:"y6-ld",name:"Long division",gen:["longDiv"],emoji:"🚌"},
      {id:"y6-bid",name:"Order of operations",gen:["bidmas"],emoji:"🧮"},
      {id:"y6-pct",name:"Any percentage of an amount",gen:["pctAny"],emoji:"💯"},
      {id:"y6-af",name:"Fractions with different bottoms",gen:["addFracAny"],emoji:"🧩"},
      {id:"y6-mf",name:"Fractions times and divided by whole numbers",gen:["mulFrac","divFrac"],emoji:"🧩"},
      {id:"y6-dec",name:"Decimals to 3 places",gen:["decAdd3","mulDec"],emoji:"🔸"},
      {id:"y6-mix",name:"Mixed arithmetic warm-up",gen:["tablesAll","shortDiv4","pow10dec","pctAny","addFracAny","bidmas","longMul4x2","decAddSub"],emoji:"🎯"}]}
  ];

  window.BBLearn={R:R,pick:pick,fmt:fmt,gcd:gcd,M:M,G:G,LADDER:LADDER,fr:fr,
    make:function(topic){var g=pick(topic.gen);var q=G[g]();q.topic=topic.name;return q},
    explain:function(m){var f=M[m[0]];return f?f.apply(null,m.slice(1)):null}};
})();
