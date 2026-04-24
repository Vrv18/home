// Slide 05 — Three pillars with live telemetry
(function(){
  const { useEffect, useState } = React;

  function Slide05_Pillars(){
    return (
      <div className="page">
        <div className="page-hd">
          <div className="brand"><div className="mark"></div><span>PORTKEY</span></div>
          <div><span className="mono">05 / 07 · WHAT IT GIVES YOU</span></div>
        </div>

        <div style={{marginTop:0}}>
          <div className="kicker" style={{marginBottom:18}}><span className="dot"></span>THE CONTROL PLANE, LIVE</div>
          <h2 className="serif" style={{fontSize:88, lineHeight:.98, margin:0, letterSpacing:"-0.02em", fontWeight:400}}>
            Three jobs. <span style={{fontStyle:"italic", color:"var(--accent)"}}>One surface.</span>
          </h2>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:28, marginTop:40}}>
          <PillarCard n="01" title="AUTHENTICATION" caption="Portkey API key → scoped to agents.invoke">
            <AuthViz/>
          </PillarCard>
          <PillarCard n="02" title="ACCESS CONTROL" caption="Skills & capabilities, per workspace">
            <SkillsViz/>
          </PillarCard>
          <PillarCard n="03" title="OBSERVABILITY" caption="Every request, attributable & searchable">
            <ThroughputViz/>
          </PillarCard>
        </div>

        <div className="page-ft" style={{marginTop:24}}>
          <div>REGISTRY · VIRTUAL SERVERS · LOGS</div>
          <div className="mono">05 / 07</div>
        </div>
      </div>
    );
  }

  function PillarCard({n, title, caption, children}){
    return (
      <div style={{
        border:".5px solid var(--rule)", borderRadius:14,
        background:"var(--bg-2)", padding:"24px 26px 26px",
        display:"flex", flexDirection:"column", minHeight:560
      }}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
          <div className="mono" style={{fontSize:13, color:"var(--accent)", letterSpacing:".14em"}}>{n}</div>
          <div className="mono" style={{fontSize:11, color:"var(--muted)", letterSpacing:".18em"}}>LIVE</div>
        </div>
        <div style={{fontSize:28, fontWeight:600, marginTop:10, letterSpacing:"-.01em"}}>{title}</div>
        <div style={{fontSize:15, color:"var(--muted)", marginTop:6, lineHeight:1.4}}>{caption}</div>
        <div style={{flex:1, marginTop:22, display:"flex"}}>{children}</div>
      </div>
    );
  }

  // ─── Auth viz: api key → scope check ──────────────────────────────
  function AuthViz(){
    const [step, setStep] = useState(0);
    useEffect(() => { const id = setInterval(() => setStep(s => (s+1)%4), 1100); return () => clearInterval(id); }, []);
    const scopes = [
      {k:"agents.invoke",  ok:true},
      {k:"agents.manage",  ok:false},
      {k:"logs.read",      ok:true},
    ];
    return (
      <div style={{width:"100%", display:"flex", flexDirection:"column", gap:14}}>
        <div style={{
          border:".5px solid var(--rule)", borderRadius:10, padding:"12px 14px",
          background:"var(--bg)", fontFamily:"var(--mono)", fontSize:13
        }}>
          <div style={{color:"var(--muted)", fontSize:10, letterSpacing:".16em", marginBottom:6}}>INBOUND</div>
          <div><span style={{color:"var(--muted)"}}>x-portkey-api-key:</span> <span style={{color:"var(--ink)"}}>pk-live-</span><span style={{color:"var(--accent)"}}>aB7xQ2…</span></div>
        </div>

        <div style={{
          borderRadius:10, padding:"14px 14px",
          background:"var(--ink)", color:"var(--bg)"
        }}>
          <div style={{fontFamily:"var(--mono)", fontSize:10, letterSpacing:".18em", opacity:.6, marginBottom:8}}>SCOPE CHECK</div>
          {scopes.map((s,i) => (
            <div key={s.k} style={{display:"flex", alignItems:"center", gap:10, padding:"4px 0", opacity: step>=i?1:.25, transition:"opacity .4s"}}>
              <span style={{
                width:18, height:18, borderRadius:4,
                background: s.ok ? "var(--ok)" : "#B03A2E",
                color:"#fff", fontFamily:"var(--mono)", fontSize:11,
                display:"inline-flex", alignItems:"center", justifyContent:"center"
              }}>{s.ok ? "✓" : "✕"}</span>
              <span style={{fontFamily:"var(--mono)", fontSize:13}}>{s.k}</span>
            </div>
          ))}
        </div>

        <div style={{
          border:".5px solid var(--ok)", borderRadius:10, padding:"12px 14px",
          background:"color-mix(in oklab, var(--ok) 12%, var(--bg))",
          fontFamily:"var(--mono)", fontSize:13, color:"var(--ok)", display:"flex", justifyContent:"space-between"
        }}>
          <span>→ FORWARD TO UPSTREAM</span>
          <span>200</span>
        </div>
      </div>
    );
  }

  // ─── Skills viz ──────────────────────────────────────────────
  function SkillsViz(){
    const skills = [
      {k:"ping",        on:true},
      {k:"web.search",  on:true},
      {k:"files.read",  on:true},
      {k:"files.write", on:false},
      {k:"mail.send",   on:false},
      {k:"db.query",    on:true},
    ];
    return (
      <div style={{width:"100%", display:"flex", flexDirection:"column", gap:10}}>
        <div style={{display:"flex", justifyContent:"space-between", fontFamily:"var(--mono)", fontSize:11, letterSpacing:".16em", color:"var(--muted)"}}>
          <span>WORKSPACE · PROD-AGENTS</span>
          <span style={{color:"var(--accent)"}}>AGENT · ops-agent</span>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:4}}>
          {skills.map(s => (
            <div key={s.k} style={{
              border:".5px solid var(--rule)",
              background: s.on ? "var(--bg)" : "transparent",
              borderRadius:8, padding:"12px 14px",
              fontFamily:"var(--mono)", fontSize:13,
              display:"flex", justifyContent:"space-between", alignItems:"center",
              opacity: s.on?1:.45
            }}>
              <span>{s.k}</span>
              <span style={{
                width:28, height:16, borderRadius:10,
                background: s.on ? "var(--accent)" : "var(--wire)",
                position:"relative"
              }}>
                <span style={{
                  position:"absolute", top:2, left: s.on ? 14 : 2,
                  width:12, height:12, borderRadius:"50%", background:"#fff",
                  transition:"left .3s"
                }}></span>
              </span>
            </div>
          ))}
        </div>
        <div style={{marginTop:"auto", paddingTop:14, borderTop:".5px solid var(--rule-2)", display:"flex", justifyContent:"space-between", fontFamily:"var(--mono)", fontSize:11, color:"var(--muted)"}}>
          <span>4 OF 6 ENABLED</span>
          <span>POLICY · least-privilege</span>
        </div>
      </div>
    );
  }

  // ─── Throughput viz ────────────────────────────────────
  function ThroughputViz(){
    const [series, setSeries] = useState(() => Array.from({length:40}, () => 0.3+Math.random()*0.6));
    useEffect(() => {
      const id = setInterval(() => setSeries(s => {
        const n = s.slice(1); n.push(0.25 + Math.random()*0.7); return n;
      }), 220);
      return () => clearInterval(id);
    }, []);
    const max = Math.max(...series);
    return (
      <div style={{width:"100%", display:"flex", flexDirection:"column", gap:10}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
          <div>
            <div className="mono" style={{fontSize:10, letterSpacing:".18em", color:"var(--muted)"}}>REQUESTS · 5M WINDOW</div>
            <div className="mono" style={{fontSize:44, letterSpacing:"-.02em", marginTop:4}}>{Math.round(18200+series[series.length-1]*3600).toLocaleString()}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div className="mono" style={{fontSize:10, letterSpacing:".18em", color:"var(--muted)"}}>ERRORS</div>
            <div className="mono" style={{fontSize:22, color:"#B03A2E", marginTop:4}}>0.03%</div>
          </div>
        </div>

        <svg viewBox="0 0 320 120" style={{width:"100%", height:130}}>
          <defs>
            <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--accent)" stopOpacity=".4"/>
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {series.map((v,i) => {
            const x = (i/(series.length-1))*320;
            return null;
          })}
          <path d={`M 0 120 ${series.map((v,i) => `L ${(i/(series.length-1))*320} ${120 - (v/max)*110}`).join(" ")} L 320 120 Z`} fill="url(#area)"/>
          <path d={`M 0 ${120 - (series[0]/max)*110} ${series.map((v,i) => `L ${(i/(series.length-1))*320} ${120 - (v/max)*110}`).join(" ")}`}
            fill="none" stroke="var(--accent)" strokeWidth="1.4"/>
        </svg>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10}}>
          <MiniStat label="P50" value="38ms"/>
          <MiniStat label="P95" value="84ms"/>
          <MiniStat label="P99" value="212ms"/>
        </div>
      </div>
    );
  }

  function MiniStat({label, value}){
    return (
      <div style={{border:".5px solid var(--rule-2)", borderRadius:8, padding:"10px 12px"}}>
        <div className="mono" style={{fontSize:10, letterSpacing:".16em", color:"var(--muted)"}}>{label}</div>
        <div className="mono" style={{fontSize:18, marginTop:4, letterSpacing:"-.01em"}}>{value}</div>
      </div>
    );
  }

  window.Slide05_Pillars = Slide05_Pillars;
})();
