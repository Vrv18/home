// Slide 07 — Questions
(function(){
  const { useEffect, useState } = React;

  function Slide07_Questions(){
    const [bars, setBars] = useState(() => Array.from({length:80}, () => Math.random()));
    useEffect(() => {
      const id = setInterval(() => setBars(b => { const n=b.slice(1); n.push(Math.random()); return n; }), 150);
      return () => clearInterval(id);
    }, []);
    return (
      <div className="page" style={{padding:"64px 80px", position:"relative"}}>
        <div className="page-hd">
          <div className="brand"><div className="mark"></div><span>PORTKEY</span></div>
          <div><span className="mono">07 / 07 · Q & A</span></div>
        </div>

        <div style={{display:"flex", flexDirection:"column", justifyContent:"center", margin:"auto 0", maxWidth:1700}}>
          <div className="kicker" style={{marginBottom:60}}><span className="dot"></span>OVER TO YOU</div>
          <h1 className="serif" style={{
            fontSize:320, lineHeight:.88, margin:0, letterSpacing:"-0.03em", fontWeight:400
          }}>
            Questions<span style={{color:"var(--accent)"}}>?</span>
          </h1>
          <div style={{marginTop:64, display:"grid", gridTemplateColumns:"auto auto auto 1fr", gap:56, alignItems:"end"}}>
            <LinkItem label="DOCS" value="docs.portkey.ai"/>
            <LinkItem label="APP"  value="app.portkey.ai/agents"/>
            <LinkItem label="AGENTS URL" value="agents.portkey.ai/v1/agent/{slug}"/>
            <div></div>
          </div>
        </div>

        {/* decorative live bars at bottom */}
        <div style={{position:"absolute", left:80, right:80, bottom:32, display:"flex", alignItems:"flex-end", gap:2, height:40, opacity:.5}}>
          {bars.map((v,i) => (
            <div key={i} style={{
              flex:1, height:`${20+v*80}%`,
              background: i===bars.length-1 ? "var(--accent)" : "var(--ink)",
              opacity: i===bars.length-1 ? 1 : 0.4
            }}></div>
          ))}
        </div>

        <div className="page-ft">
          <div>PORTKEY · AGENT GATEWAY</div>
          <div className="mono">THANK YOU</div>
        </div>
      </div>
    );
  }

  function LinkItem({label, value}){
    return (
      <div>
        <div className="mono" style={{fontSize:12, letterSpacing:".2em", color:"var(--muted)"}}>{label}</div>
        <div className="mono" style={{fontSize:24, marginTop:8, color:"var(--ink)"}}>{value}</div>
      </div>
    );
  }

  window.Slide07_Questions = Slide07_Questions;
})();
