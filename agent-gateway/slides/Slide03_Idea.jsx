// Slide 03 — The Idea (one-liner)
(function(){
  function Slide03_Idea(){
    return (
      <div className="page">
        <div className="page-hd">
          <div className="brand"><div className="mark"></div><span>PORTKEY</span></div>
          <div><span className="mono">03 / 07 · THE IDEA</span></div>
        </div>

        <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"flex-start", margin:"auto 0", maxWidth:1560}}>
          <div className="kicker" style={{marginBottom:56}}><span className="dot"></span>ONE SENTENCE</div>
          <h2 className="serif" style={{
            fontSize:88, lineHeight:1.08, margin:0, letterSpacing:"-0.02em", fontWeight:400,
            color:"var(--ink)", paddingBottom:16
          }}>
            Put a <span style={{fontStyle:"italic", color:"var(--accent)"}}>gateway</span> in
            front of every agent &mdash; so <u style={{textDecorationColor:"var(--accent)", textDecorationThickness:3, textUnderlineOffset:14}}>auth</u>,
            <u style={{textDecorationColor:"var(--accent)", textDecorationThickness:3, textUnderlineOffset:14}}> access</u>, and
            <u style={{textDecorationColor:"var(--accent)", textDecorationThickness:3, textUnderlineOffset:14}}> observability</u> become <em style={{fontStyle:"italic"}}>infrastructure</em>, not homework.
          </h2>

          <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:0, marginTop:104, width:"100%", borderTop:".5px solid var(--rule)"}}>
            <PillarSmall n="01" title="AUTHENTICATION" sub="Portkey API keys replace N bespoke secrets."/>
            <PillarSmall n="02" title="ACCESS CONTROL" sub="Agents, skills, workspaces — scoped by policy."/>
            <PillarSmall n="03" title="OBSERVABILITY"  sub="Every call logged, searchable, attributable."/>
          </div>
        </div>

        <div className="page-ft">
          <div>LLM GATEWAY → AGENT GATEWAY · SAME DISCIPLINE</div>
          <div className="mono">03 / 07</div>
        </div>
      </div>
    );
  }
  function PillarSmall({n,title,sub}){
    return (
      <div style={{padding:"28px 40px 0 0", borderRight:".5px solid var(--rule-2)"}}>
        <div className="mono" style={{fontSize:14, color:"var(--accent)", letterSpacing:".1em"}}>{n}</div>
        <div style={{fontSize:28, fontWeight:600, marginTop:10, letterSpacing:"-.01em"}}>{title}</div>
        <div style={{fontSize:18, color:"var(--muted)", marginTop:10, maxWidth:380, lineHeight:1.45}}>{sub}</div>
      </div>
    );
  }
  window.Slide03_Idea = Slide03_Idea;
})();
