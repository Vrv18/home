// Slide 04 — Animated Architecture (the hero)
(function(){
  const { useEffect, useState, useRef } = React;

  function Slide04_Architecture(){
    return (
      <div className="page" style={{padding:"48px 64px"}}>
        <div className="page-hd">
          <div className="brand"><div className="mark"></div><span>PORTKEY</span></div>
          <div><span className="mono">04 / 07 · ARCHITECTURE</span></div>
        </div>

        <div style={{marginTop:40, display:"grid", gridTemplateColumns:"auto 1fr", gap:48, alignItems:"start"}}>
          <div style={{maxWidth:360, paddingTop:12}}>
            <div className="kicker" style={{marginBottom:24}}><span className="dot"></span>IN THE PATH</div>
            <h2 className="serif" style={{fontSize:56, lineHeight:1.1, margin:0, letterSpacing:"-0.02em", fontWeight:400, paddingBottom:8}}>
              A proxy with a <span style={{fontStyle:"italic", color:"var(--accent)"}}>control plane.</span>
            </h2>
            <div style={{marginTop:32, fontSize:17, lineHeight:1.5, color:"var(--ink-2)"}}>
              Clients authenticate to Portkey. Portkey authorizes, forwards,
              and streams responses back &mdash; while the control plane governs
              and the log sink records.
            </div>
          </div>

          <ArchDiagram/>
        </div>

        <div className="page-ft" style={{marginTop:12}}>
          <div>A2A PROTOCOL · DROP-IN URL · NO CLIENT SDK CHANGES</div>
          <div className="mono">04 / 07</div>
        </div>
      </div>
    );
  }

  // ─── animated architecture ────────────────────────────────────────────────
  function ArchDiagram(){
    const [packets, setPackets] = useState([]);
    const idRef = useRef(0);

    useEffect(() => {
      let mounted = true;
      const spawn = () => {
        if (!mounted) return;
        idRef.current += 1;
        const id = idRef.current;
        const lane = Math.floor(Math.random()*3); // 3 client lanes
        const isAuth = Math.random() > 0.05;      // 5% denied
        setPackets(p => [...p, {id, lane, isAuth, born: performance.now()}]);
        // cleanup after animation
        setTimeout(() => {
          setPackets(p => p.filter(x => x.id !== id));
        }, 3600);
        setTimeout(spawn, 380 + Math.random()*500);
      };
      const t = setTimeout(spawn, 200);
      return () => { mounted=false; clearTimeout(t); };
    }, []);

    // Layout
    const W = 1520, H = 780;
    const laneY = [160, 300, 440];  // 3 clients
    const clientX = 120;
    const gwX = 620;
    const agentX = 1260;
    const agentY = [180, 320, 460]; // 3 agent servers

    return (
      <div style={{
        position:"relative",
        border:".5px solid var(--rule)", borderRadius:18,
        background:"var(--bg-2)",
        padding:"28px 28px 24px",
        overflow:"hidden"
      }}>
        {/* subtle grid */}
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%", height:"auto", display:"block"}}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--rule-2)" strokeWidth="0.5"/>
            </pattern>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="var(--wire)"/>
            </marker>
            <marker id="arrowAccent" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="var(--accent)"/>
            </marker>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <rect width={W} height={H} fill="url(#grid)" opacity="0.7"/>

          {/* column headers */}
          <text x={clientX} y={56} fontFamily="var(--mono)" fontSize="12" fill="var(--muted)" letterSpacing="3">CLIENTS</text>
          <text x={gwX-10}  y={56} fontFamily="var(--mono)" fontSize="12" fill="var(--muted)" letterSpacing="3">PORTKEY · AGENT GATEWAY</text>
          <text x={agentX-20} y={56} fontFamily="var(--mono)" fontSize="12" fill="var(--muted)" letterSpacing="3">AGENT SERVERS</text>

          {/* client nodes */}
          {["web-app","mobile-ios","ops-cli"].map((name,i) => (
            <g key={name} transform={`translate(${clientX} ${laneY[i]})`}>
              <rect x={-10} y={-26} width={200} height={52} rx={8}
                fill="var(--bg)" stroke="var(--rule)" strokeWidth=".5"/>
              <circle cx={14} cy={0} r={5} fill="var(--ink-2)"/>
              <text x={32} y={5} fontFamily="var(--mono)" fontSize="14" fill="var(--ink)">{name}</text>
              <text x={32} y={22} fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">x-portkey-api-key</text>
            </g>
          ))}

          {/* agent nodes */}
          {["hello-a2a","search-agent","ops-agent"].map((name,i) => (
            <g key={name} transform={`translate(${agentX} ${agentY[i]})`}>
              <rect x={-10} y={-26} width={220} height={52} rx={8}
                fill="var(--bg)" stroke="var(--rule)" strokeWidth=".5"/>
              <text x={16} y={5} fontFamily="var(--mono)" fontSize="14" fill="var(--ink)">{name}</text>
              <text x={16} y={22} fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">Authorization: Bearer …</text>
              <circle cx={204} cy={-26} r={4} fill="var(--ok)"/>
            </g>
          ))}

          {/* Gateway block */}
          <g>
            <rect x={gwX-20} y={140} width={380} height={320} rx={14}
              fill="var(--bg)"
              stroke="var(--ink)" strokeWidth="1"/>
            {/* header */}
            <rect x={gwX-20} y={140} width={380} height={44} rx={14}
              fill="var(--ink)"/>
            <rect x={gwX-20} y={170} width={380} height={14}
              fill="var(--ink)"/>
            <circle cx={gwX-4} cy={162} r={5} fill="var(--accent)"/>
            <text x={gwX+12} y={167} fontFamily="var(--mono)" fontSize="13" fill="var(--bg)" letterSpacing="2">AGENT GATEWAY</text>

            {/* inner modules */}
            <GWRow y={204} label="AUTH" detail="verify API key · scope agents.invoke"/>
            <GWRow y={256} label="POLICY" detail="workspace · skills · capabilities"/>
            <GWRow y={308} label="PROXY" detail="A2A JSON-RPC · /v1/agent/{slug}"/>
            <GWRow y={360} label="LOG" detail="request + response + metadata"/>

            {/* virtual server badge */}
            <rect x={gwX+80} y={414} width={220} height={32} rx={6} fill="var(--accent)"/>
            <text x={gwX+100} y={434} fontFamily="var(--mono)" fontSize="12" fill="#fff" letterSpacing="2">VIRTUAL SERVER URL</text>
          </g>

          {/* CONTROL PLANE — top branch from gateway */}
          <g>
            <path d={`M ${gwX+170} 140 C ${gwX+170} 100, ${gwX+170} 92, ${gwX+170} 76`}
              stroke="var(--wire)" strokeWidth=".8" strokeDasharray="3 3" fill="none"/>
            <rect x={gwX+60} y={28} width={220} height={48} rx={8}
              fill="var(--bg)" stroke="var(--rule)" strokeWidth=".5"/>
            <text x={gwX+76} y={52} fontFamily="var(--mono)" fontSize="11" fill="var(--muted)" letterSpacing="2">CONTROL PLANE</text>
            <text x={gwX+76} y={68} fontFamily="var(--mono)" fontSize="11" fill="var(--ink)">auth · access · skills</text>
          </g>

          {/* LOG SINK — bottom branch */}
          <g>
            <path d={`M ${gwX+170} 460 C ${gwX+170} 540, ${gwX+170} 560, ${gwX+170} 620`}
              stroke="var(--wire)" strokeWidth=".8" strokeDasharray="3 3" fill="none"/>
            <rect x={gwX+40} y={622} width={260} height={110} rx={8}
              fill="var(--bg)" stroke="var(--rule)" strokeWidth=".5"/>
            <text x={gwX+56} y={644} fontFamily="var(--mono)" fontSize="11" fill="var(--muted)" letterSpacing="2">SECURE LOGGING</text>
            <LogStream x={gwX+56} y={656}/>
          </g>

          {/* wires client→gateway */}
          {laneY.map((y,i) => (
            <path key={"cw"+i}
              d={`M ${clientX+200} ${y} C ${(clientX+200+gwX)/2} ${y}, ${(clientX+200+gwX)/2} ${240+i*60}, ${gwX-20} ${240+i*60}`}
              fill="none" stroke="var(--wire)" strokeWidth="1" strokeOpacity=".5"
              markerEnd="url(#arrow)"/>
          ))}

          {/* wires gateway→agent */}
          {agentY.map((y,i) => (
            <path key={"aw"+i}
              d={`M ${gwX+360} ${240+i*60} C ${(gwX+360+agentX)/2} ${240+i*60}, ${(gwX+360+agentX)/2} ${y}, ${agentX-10} ${y}`}
              fill="none" stroke="var(--wire)" strokeWidth="1" strokeOpacity=".5"
              markerEnd="url(#arrow)"/>
          ))}

          {/* animated packets */}
          {packets.map(p => <Packet key={p.id} lane={p.lane} isAuth={p.isAuth} clientX={clientX} gwX={gwX} agentX={agentX} laneY={laneY} agentY={agentY}/>)}
        </svg>

        {/* legend */}
        <div style={{
          position:"absolute", left:28, bottom:18,
          display:"flex", gap:22, fontFamily:"var(--mono)", fontSize:11, color:"var(--muted)", letterSpacing:".1em"
        }}>
          <LegendDot color="var(--accent)" label="REQUEST · AUTHENTICATED"/>
          <LegendDot color="var(--ink-2)"  label="RESPONSE · STREAMED"/>
          <LegendDot color="#B03A2E"       label="DENIED · POLICY"/>
        </div>
      </div>
    );
  }

  function GWRow({y, label, detail}){
    return (
      <g transform={`translate(0 ${y})`}>
        <rect x={620-20+12} y={-16} width={356} height={36} rx={6} fill="var(--bg-2)"/>
        <text x={620-20+22} y={6} fontFamily="var(--mono)" fontSize="12" fill="var(--accent)" letterSpacing="2">{label}</text>
        <text x={620-20+110} y={6} fontFamily="var(--mono)" fontSize="12" fill="var(--ink-2)">{detail}</text>
      </g>
    );
  }

  function Packet({lane, isAuth, clientX, gwX, agentX, laneY, agentY}){
    // 3 leg animation: client→gw (0–33%), gw process (33–55%), gw→agent (55–100%)
    const y0 = laneY[lane];
    const midY = 240 + lane*60;
    const agentLane = lane; // simple mapping
    const y1 = agentY[agentLane];

    // CSS keyframes inline via style attr + computed transform unsupported,
    // so use two nested animated groups with SMIL.
    const color = isAuth ? "var(--accent)" : "#B03A2E";
    return (
      <g filter="url(#glow)">
        {/* leg 1 */}
        <circle r={5} fill={color}>
          <animateMotion dur="1.1s" repeatCount="1" fill="freeze"
            path={`M ${clientX+200} ${y0} C ${(clientX+200+gwX)/2} ${y0}, ${(clientX+200+gwX)/2} ${midY}, ${gwX-20} ${midY}`} />
          <animate attributeName="opacity" from="1" to={isAuth?1:0} begin="1.1s" dur=".01s" fill="freeze"/>
        </circle>
        {/* leg 2: continue through gateway after delay; only if authed */}
        {isAuth && (
          <circle r={5} fill={color} opacity="0">
            <animate attributeName="opacity" from="0" to="1" begin="1.3s" dur=".01s" fill="freeze"/>
            <animateMotion dur="1.1s" begin="1.3s" repeatCount="1" fill="freeze"
              path={`M ${gwX+360} ${midY} C ${(gwX+360+agentX)/2} ${midY}, ${(gwX+360+agentX)/2} ${y1}, ${agentX-10} ${y1}`}/>
          </circle>
        )}
        {/* log drop */}
        {isAuth && (
          <circle r={3} fill="var(--wire)" opacity="0">
            <animate attributeName="opacity" from="0" to="1" begin="1.15s" dur=".01s" fill="freeze"/>
            <animateMotion dur=".8s" begin="1.15s" repeatCount="1" fill="freeze"
              path={`M ${gwX+170} 460 C ${gwX+170} 520, ${gwX+170} 560, ${gwX+170} 622`}/>
            <animate attributeName="opacity" from="1" to="0" begin="2s" dur=".2s" fill="freeze"/>
          </circle>
        )}
      </g>
    );
  }

  function LogStream({x,y}){
    const [lines, setLines] = useState([
      "200  web-app      hello-a2a      tasks/send     42ms",
      "200  ops-cli      search-agent   tasks/send     88ms",
    ]);
    useEffect(() => {
      const sample = [
        "200  web-app      hello-a2a      tasks/send",
        "200  mobile-ios   search-agent   tasks/send",
        "200  ops-cli      ops-agent      tasks/send",
        "403  web-app      ops-agent      [denied]   ",
        "200  mobile-ios   hello-a2a      tasks/send",
      ];
      const id = setInterval(() => {
        setLines(L => {
          const s = sample[Math.floor(Math.random()*sample.length)];
          const ms = s.startsWith("403") ? "  7ms" : `${20+Math.floor(Math.random()*90)}ms`;
          const line = `${s}     ${ms}`.padEnd(60,' ');
          const next = [...L, line].slice(-3);
          return next;
        });
      }, 900);
      return () => clearInterval(id);
    }, []);
    return (
      <g>
        {lines.map((l,i) => (
          <text key={i+l} x={x} y={y + i*18} fontFamily="var(--mono)" fontSize="11"
            fill={l.startsWith("403") ? "#B03A2E" : "var(--ink-2)"}>
            {l}
          </text>
        ))}
      </g>
    );
  }

  function LegendDot({color, label}){
    return (
      <span style={{display:"inline-flex", alignItems:"center", gap:8}}>
        <span style={{width:8, height:8, borderRadius:"50%", background:color}}></span>
        {label}
      </span>
    );
  }

  window.Slide04_Architecture = Slide04_Architecture;
})();
