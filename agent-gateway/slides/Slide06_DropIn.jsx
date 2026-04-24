// Slide 06 — Drop-in: your code doesn't change
(function(){
  const { useEffect, useState } = React;

  function Slide06_DropIn(){
    const [on, setOn] = useState(true);
    useEffect(() => { const id = setInterval(() => setOn(v => !v), 2400); return () => clearInterval(id); }, []);

    return (
      <div className="page">
        <div className="page-hd">
          <div className="brand"><div className="mark"></div><span>PORTKEY</span></div>
          <div><span className="mono">06 / 07 · DROP IN</span></div>
        </div>

        <div style={{marginTop:12}}>
          <div className="kicker" style={{marginBottom:24}}><span className="dot"></span>ONE LINE CHANGES</div>
          <h2 className="serif" style={{fontSize:108, lineHeight:.98, margin:0, letterSpacing:"-0.02em", fontWeight:400, maxWidth:1400}}>
            Swap the URL. <span style={{fontStyle:"italic", color:"var(--accent)"}}>Keep the SDK.</span>
          </h2>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, marginTop:60, alignItems:"stretch"}}>
          {/* BEFORE */}
          <UrlCard
            state="before"
            badge="BEFORE"
            badgeColor="var(--muted)"
            url="https://hello.a2aregistry.org"
            note="direct, per-team auth, unlogged"
          />
          {/* AFTER */}
          <UrlCard
            state="after"
            badge="AFTER"
            badgeColor="var(--accent)"
            url="https://agents.portkey.ai/v1/agent/hello-a2a"
            note="portkey key, scoped, observable"
            pulse={on}
          />
        </div>

        {/* arrow + annotation */}
        <div style={{display:"flex", justifyContent:"center", alignItems:"center", marginTop:44, gap:20}}>
          <div style={{flex:1, height:".5px", background:"var(--rule)"}}></div>
          <div className="mono" style={{fontSize:13, letterSpacing:".2em", color:"var(--muted)", whiteSpace:"nowrap"}}>SAME CLIENT CODE · SAME PROTOCOL · SAME RESPONSES</div>
          <div style={{flex:1, height:".5px", background:"var(--rule)"}}></div>
        </div>

        <div className="page-ft" style={{marginTop:44}}>
          <div>A2A JSON-RPC PRESERVED END-TO-END</div>
          <div className="mono">06 / 07</div>
        </div>
      </div>
    );
  }

  function UrlCard({state, badge, badgeColor, url, note, pulse}){
    const isAfter = state === "after";
    return (
      <div style={{
        position:"relative",
        border: isAfter ? "1px solid var(--accent)" : ".5px solid var(--rule)",
        borderRadius:14,
        background: isAfter ? "var(--bg)" : "var(--bg-2)",
        padding:"28px 32px 32px",
        minHeight:260,
        boxShadow: isAfter ? "0 20px 60px -30px color-mix(in oklab, var(--accent) 40%, transparent)" : "none"
      }}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22}}>
          <div className="mono" style={{fontSize:12, letterSpacing:".22em", color:badgeColor, fontWeight:600}}>{badge}</div>
          <div className="mono" style={{fontSize:11, letterSpacing:".18em", color:"var(--muted)"}}>
            {isAfter ? "/v1/agent/{slug}" : "UPSTREAM"}
          </div>
        </div>

        {/* URL bar */}
        <div style={{
          fontFamily:"var(--mono)", fontSize:22,
          letterSpacing:"-.01em",
          padding:"22px 24px",
          background:"var(--bg-2)",
          border:".5px solid var(--rule)",
          borderRadius:10,
          whiteSpace:"nowrap",
          overflow:"hidden",
          textOverflow:"ellipsis",
          position:"relative"
        }}>
          {isAfter ? (
            <>
              <span style={{color:"var(--muted)"}}>https://</span>
              <span style={{color:"var(--accent)", fontWeight:600}}>agents.portkey.ai</span>
              <span style={{color:"var(--muted)"}}>/v1/agent/</span>
              <span style={{color:"var(--ink)"}}>hello-a2a</span>
              {pulse && (
                <span style={{
                  position:"absolute", right:16, top:"50%", transform:"translateY(-50%)",
                  width:8, height:8, borderRadius:"50%", background:"var(--ok)",
                  boxShadow:"0 0 0 6px color-mix(in oklab, var(--ok) 20%, transparent)"
                }}></span>
              )}
            </>
          ) : (
            <>
              <span style={{color:"var(--muted)"}}>https://</span>
              <span style={{color:"var(--ink)"}}>hello.a2aregistry.org</span>
            </>
          )}
        </div>

        {/* header row */}
        <div style={{marginTop:18, fontFamily:"var(--mono)", fontSize:15, color:"var(--ink-2)"}}>
          {isAfter ? (
            <>
              <span style={{color:"var(--muted)"}}>header </span>
              <span>x-portkey-api-key: </span>
              <span style={{color:"var(--accent)"}}>pk-live-aB7xQ2…</span>
            </>
          ) : (
            <>
              <span style={{color:"var(--muted)"}}>header </span>
              <span>Authorization: </span>
              <span style={{color:"var(--ink-2)"}}>Bearer secret-key-1</span>
              <span style={{color:"var(--muted)"}}> · stored in .env</span>
            </>
          )}
        </div>

        <div style={{
          position:"absolute", bottom:16, left:32, right:32,
          display:"flex", justifyContent:"space-between",
          fontFamily:"var(--mono)", fontSize:11, letterSpacing:".14em",
          color:"var(--muted)",
          paddingTop:14, borderTop:".5px solid var(--rule-2)"
        }}>
          <span>{note.toUpperCase()}</span>
          <span>{isAfter ? "✓ LOGGED · SCOPED" : "— NO CONTROLS"}</span>
        </div>
      </div>
    );
  }

  window.Slide06_DropIn = Slide06_DropIn;
})();
