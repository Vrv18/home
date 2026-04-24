// Slide 01 — Cover
(function(){
  const { useEffect, useState } = React;

  function Slide01_Cover(){
    const [tick, setTick] = useState(0);
    useEffect(() => { const id = setInterval(() => setTick(t => t+1), 1000); return () => clearInterval(id); }, []);
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');

    return (
      <div className="page" style={{padding:"56px 80px"}}>
        {/* header */}
        <div className="page-hd">
          <div className="brand"><div className="mark"></div><span>PORTKEY</span></div>
          <div className="mono">WEBINAR · APR 2026</div>
        </div>

        {/* middle */}
        <div style={{display:"grid", gridTemplateColumns:"1.25fr 1fr", alignItems:"end", gap:80, marginTop:40}}>
          <div>
            <div className="kicker" style={{marginBottom:48}}><span className="dot"></span>NEW · AGENT GATEWAY</div>
            <h1 className="serif" style={{
              fontSize:168, lineHeight:.96, margin:0, letterSpacing:"-0.02em",
              fontWeight:400, color:"var(--ink)"
            }}>
              One gateway<br/>
              for every<br/>
              <span style={{fontStyle:"italic", color:"var(--accent)"}}>agent.</span>
            </h1>
            <div style={{marginTop:36, maxWidth:640, fontSize:22, lineHeight:1.45, color:"var(--ink-2)"}}>
              Centralized authentication, access control, and observability —
              from the team that brought it to your LLMs.
            </div>
          </div>

          {/* side card — "live" telemetry feel */}
          <TelemetryCard />
        </div>

        {/* footer */}
        <div className="page-ft" style={{marginTop:48}}>
          <div>A2A · MCP · AGENT FRAMEWORKS</div>
          <div className="mono">{hh}:{mm} · LIVE</div>
        </div>
      </div>
    );
  }

  function TelemetryCard(){
    const [bars, setBars] = useState(() => Array.from({length:32}, () => 0.2 + Math.random()*0.8));
    useEffect(() => {
      const id = setInterval(() => {
        setBars(prev => {
          const next = prev.slice(1);
          next.push(0.2 + Math.random()*0.8);
          return next;
        });
      }, 180);
      return () => clearInterval(id);
    }, []);
    return (
      <div style={{
        border:".5px solid var(--rule)", borderRadius:14,
        background:"color-mix(in oklab, var(--bg-2), transparent 0%)",
        padding:"28px 32px", alignSelf:"stretch", marginBottom:8
      }}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
          <div className="mono" style={{fontSize:12, letterSpacing:".2em", color:"var(--muted)"}}>REQUESTS / SEC</div>
          <div style={{display:"flex", alignItems:"center", gap:8, fontFamily:"var(--mono)", fontSize:12, color:"var(--muted)"}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:"var(--ok)",boxShadow:"0 0 0 3px color-mix(in oklab, var(--ok) 20%, transparent)"}}></span>
            LIVE
          </div>
        </div>
        <div className="mono" style={{fontSize:88, lineHeight:1, letterSpacing:"-0.02em", marginTop:8, color:"var(--ink)"}}>
          {Math.round(240 + bars[bars.length-1]*180)}
          <span style={{fontSize:28, color:"var(--muted)", marginLeft:10}}>rps</span>
        </div>
        <div style={{display:"flex", alignItems:"flex-end", gap:4, height:120, marginTop:20}}>
          {bars.map((v,i) => (
            <div key={i} style={{
              flex:1, height:`${v*100}%`,
              background: i===bars.length-1 ? "var(--accent)" : "var(--ink)",
              opacity: i===bars.length-1 ? 1 : (0.3 + (i/bars.length)*0.5),
              transition:"height .6s ease"
            }}></div>
          ))}
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:24, marginTop:24, paddingTop:20, borderTop:".5px solid var(--rule-2)"}}>
          <Stat label="AGENTS" value="47"/>
          <Stat label="P95" value="84ms"/>
          <Stat label="AUTH OK" value="99.98%"/>
        </div>
      </div>
    );
  }
  function Stat({label, value}){
    return (
      <div>
        <div className="mono" style={{fontSize:10, letterSpacing:".18em", color:"var(--muted)"}}>{label}</div>
        <div className="mono" style={{fontSize:28, marginTop:4, letterSpacing:"-.02em"}}>{value}</div>
      </div>
    );
  }

  window.Slide01_Cover = Slide01_Cover;
})();
