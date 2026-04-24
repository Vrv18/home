// app.jsx — mounts each slide component into its <section> in <deck-stage>.
(function(){
  const { useEffect } = React;
  const TWEAK_DEFAULTS = window.__TWEAK_DEFAULTS__;

  function applyTweaks(t){
    const r = document.documentElement;
    r.setAttribute('data-theme', t.dark ? 'dark' : 'light');
    r.setAttribute('data-fonts', t.fontPairing);
  }

  function Root(){
    const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
    useEffect(() => { applyTweaks(t); }, [t]);

    return (
      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakToggle label="Dark mode" value={t.dark}
                     onChange={(v) => setTweak('dark', v)} />
        <TweakSection label="Typography" />
        <TweakRadio label="Font pairing" value={t.fontPairing}
                    options={[
                      {label:'Inter / Plex', value:'inter-plex'},
                      {label:'Grotesk / JB',  value:'grotesk'},
                      {label:'Geist',         value:'geist'},
                    ]}
                    onChange={(v) => setTweak('fontPairing', v)} />
      </TweaksPanel>
    );
  }

  // Mount each slide component into its <section>
  const slides = [
    ['s01', window.Slide01_Cover],
    ['s02', window.Slide02_Problem],
    ['s03', window.Slide03_Idea],
    ['s04', window.Slide04_Architecture],
    ['s05', window.Slide05_Pillars],
    ['s06', window.Slide06_DropIn],
    ['s07', window.Slide07_Questions],
  ];
  for (const [id, Comp] of slides) {
    const el = document.getElementById(id);
    if (el && Comp) ReactDOM.createRoot(el).render(<Comp />);
  }

  // Mount tweaks panel
  const panel = document.createElement('div');
  document.body.appendChild(panel);
  ReactDOM.createRoot(panel).render(<Root />);

  // Apply defaults synchronously
  applyTweaks(TWEAK_DEFAULTS);
})();
