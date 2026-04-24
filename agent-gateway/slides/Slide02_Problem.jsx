// Slide 02 — The Problem: agent sprawl
(function(){
  const { useEffect, useState } = React;

  function Slide02_Problem(){
    return (
      <div className="page">
        <div className="page-hd">
          <div className="brand"><div className="mark"></div><span>PORTKEY</span></div>
          <div><span className="mono">02 / 07 · THE PROBLEM</span></div>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1.15fr", gap:80, alignItems:"center", marginTop:24}}>
          <div>
            <div className="kicker" style={{marginBottom:28}}><span className="dot"></span>WHERE WE ARE</div>
            <h2 className="serif" style={{fontSize:92, lineHeight:1, margin:0, letterSpacing:"-0.02em", fontWeight:400, paddingBottom:12}}>
              Agents shipped<br/>
              faster than<br/>
              <span style={{fontStyle:"italic", color:"var(--accent)"}}>governance could.</span>
            </h2>
            <div style={{marginTop:40, fontSize:20, lineHeight:1.5, color:"var(--ink-2)", maxWidth:600}}>
              Every team wires its own auth. Keys sit in
              <span className="mono" style={{color:"var(--ink)"}}> .env</span> files.
              Access is all-or-nothing. Nobody can answer <em>who called what, when, and why</em>.
            </div>
          </div>

          <SprawlDiagram/>
        </div>

        <div className="page-ft" style={{marginTop:24}}>
          <div>N TEAMS · N AUTH STRATEGIES · N BLIND SPOTS</div>
          <div className="mono">02 / 07</div>
        </div>
      </div>
    );
  }

  function SprawlDiagram(){
    // Left: 6 client apps. Right: 6 agent servers. Tangled lines between them.
    const clients = ["web-app","mobile-ios","analytics","support-bot","ops-cli","internal-portal"];
    const agents  = ["hello-a2a","search-agent","sales-agent","ops-agent","calc-agent","mail-agent"];
    const [blink, setBlink] = useState(0);
    useEffect(() => { const id = setInterval(() => setBlink(b=>b+1), 1400); return () => clearInterval(id); }, []);

    // deterministic pseudo-random pairs
    const pairs = [];
    for (let i=0;i<clients.length;i++){
      for (let j=0;j<agents.length;j++){
        if (((i*3 + j*5 + 7) % 7) < 4) pairs.push([i,j]);
      }
    }

    const W=820, H=720, colX=[120, 700];
    const yOf = (i, n) => 60 + i*((H-120)/(n-1));

    return (
      <div style={{
        position:"relative",
        border:".5px solid var(--rule)",
        borderRadius:14,
        padding:28,
        background:"var(--bg-2)",
        minHeight:720
      }}>
        <div style={{display:"flex", justifyContent:"space-between", fontFamily:"var(--mono)", fontSize:11, letterSpacing:".18em", color:"var(--muted)", marginBottom:16}}>
          <span>CLIENTS</span>
          <span style={{color:"var(--accent)"}}>※ NO GATEWAY</span>
          <span>AGENT SERVERS</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%", height:"auto", display:"block"}}>
          {/* tangled lines */}
          {pairs.map(([i,j],k) => {
            const x1=colX[0], y1=yOf(i,clients.length);
            const x2=colX[1], y2=yOf(j,agents.length);
            const cx=(x1+x2)/2 + ((k%3)-1)*40;
            const isHot = (k + blink) % pairs.length < 2;
            return (
              <path key={k} d={`M${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke={isHot ? "var(--accent)" : "var(--wire)"}
                strokeWidth={isHot ? 1.4 : 0.6}
                strokeOpacity={isHot ? 0.9 : 0.45}
              />
            );
          })}
          {/* nodes */}
          {clients.map((c,i) => (
            <g key={"c"+i} transform={`translate(${colX[0]} ${yOf(i,clients.length)})`}>
              <rect x={-110} y={-18} width={160} height={36} rx={6}
                fill="var(--bg)" stroke="var(--rule)" strokeWidth=".5"/>
              <text x={-100} y={5} fontFamily="var(--mono)" fontSize="13" fill="var(--ink)">{c}</text>
            </g>
          ))}
          {agents.map((c,j) => (
            <g key={"a"+j} transform={`translate(${colX[1]} ${yOf(j,agents.length)})`}>
              <rect x={-50} y={-18} width={160} height={36} rx={6}
                fill="var(--bg)" stroke="var(--rule)" strokeWidth=".5"/>
              <text x={-40} y={5} fontFamily="var(--mono)" fontSize="13" fill="var(--ink)">{c}</text>
              <circle cx={-58} cy={0} r={3} fill="var(--accent-2)"/>
            </g>
          ))}
        </svg>

        {/* failure annotations */}
        <div style={{position:"absolute", right:28, bottom:20, display:"flex", gap:18, fontFamily:"var(--mono)", fontSize:11, color:"var(--muted)", letterSpacing:".1em"}}>
          <span>× SECRETS IN .ENV</span>
          <span>× NO AUDIT TRAIL</span>
          <span>× NO RATE LIMITS</span>
        </div>
      </div>
    );
  }

  window.Slide02_Problem = Slide02_Problem;
})();
