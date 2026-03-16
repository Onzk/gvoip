import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAllowedIpbx } from "@/hooks/useAllowedIpbx";
import { RefreshCw, ZoomIn, ZoomOut, RotateCcw, Activity, Maximize2 } from "lucide-react";

interface IPBX { id:string;name:string;ip_address:string;status:string;ping_latency:number|null;country_id:string|null; }
interface SipTrunk { id:string;name:string;ipbx_id:string;remote_ipbx_id:string|null;status:string;latency:number|null;channels:number|null;max_channels:number|null;provider:string|null; }
interface NodePos { x:number;y:number; }

const NS:Record<string,{c:string;g:string;r:string}> = {
  online:  {c:"#00e5ff",g:"rgba(0,229,255,0.55)", r:"rgba(0,229,255,0.18)"},
  offline: {c:"#ff3d57",g:"rgba(255,61,87,0.55)",  r:"rgba(255,61,87,0.18)"},
  _:       {c:"#f59e0b",g:"rgba(245,158,11,0.55)", r:"rgba(245,158,11,0.18)"},
};
const TS:Record<string,{c:string;d:string}> = {
  up:   {c:"#00e5ff",d:"none"},
  down: {c:"#ff3d57",d:"8,5"},
  _:    {c:"#f59e0b",d:"4,3"},
};
const ns = (s:string) => NS[s]||NS._;
const ts = (s:string) => TS[s]||TS._;

const autoLayout = (n:number,cx:number,cy:number):NodePos[] => {
  if(!n) return [];
  if(n===1) return [{x:cx,y:cy}];
  const r=Math.min(270,110+n*32);
  return Array.from({length:n},(_,i)=>({
    x:cx+r*Math.cos(2*Math.PI*i/n-Math.PI/2),
    y:cy+r*Math.sin(2*Math.PI*i/n-Math.PI/2),
  }));
};

const NetworkMap = () => {
  const {applyFilter,allowedIpbxIds,isAdmin,ready} = useAllowedIpbx();
  const [ipbxList,setIpbxList]=useState<IPBX[]>([]);
  const [trunks,setTrunks]=useState<SipTrunk[]>([]);
  const [pos,setPos]=useState<Record<string,NodePos>>({});
  const [loading,setLoading]=useState(true);
  const [zoom,setZoom]=useState(1);
  const [pan,setPan]=useState({x:0,y:0});
  const [drag,setDrag]=useState<string|null>(null);
  const [dragOff,setDragOff]=useState({x:0,y:0});
  const [panning,setPanning]=useState(false);
  const [panStart,setPanStart]=useState({x:0,y:0});
  const [hN,setHN]=useState<string|null>(null);
  const [hT,setHT]=useState<string|null>(null);
  const [tick,setTick]=useState(0);
  const [full,setFull]=useState(false);
  const svgRef=useRef<SVGSVGElement>(null);
  const W=1100,H=600;

  useEffect(()=>{const id=setInterval(()=>setTick(t=>(t+1)%2000),25);return()=>clearInterval(id);},[]);

  const fetchData=useCallback(async()=>{
    setLoading(true);
    let q:any=supabase.from("ipbx").select("id,name,ip_address,status,ping_latency,country_id");
    if(!isAdmin&&allowedIpbxIds?.length) q=q.in("id",allowedIpbxIds);
    else if(!isAdmin&&allowedIpbxIds!==null) q=q.in("id",["00000000-0000-0000-0000-000000000000"]);
    const [r1,r2]=await Promise.all([q,
      applyFilter(supabase.from("sip_trunks").select("id,name,ipbx_id,remote_ipbx_id,status,latency,channels,max_channels,provider"))]);
    const nodes:IPBX[]=r1.data||[];
    setIpbxList(nodes); setTrunks(r2.data||[]);
    setPos(prev=>{
      const next={...prev};
      const fresh=nodes.filter(n=>!next[n.id]);
      if(fresh.length){const p=autoLayout(nodes.length,W/2,H/2-20);nodes.forEach((n,i)=>{if(!next[n.id])next[n.id]=p[i];});}
      return next;
    });
    setLoading(false);
  },[isAdmin,allowedIpbxIds,applyFilter]);

  useEffect(()=>{if(ready)fetchData();},[ready,fetchData]);
  useEffect(()=>{if(!ready)return;const id=setInterval(fetchData,30000);return()=>clearInterval(id);},[ready,fetchData]);

  const resetLayout=()=>{
    const p=autoLayout(ipbxList.length,W/2,H/2-20);
    const next:Record<string,NodePos>={};
    ipbxList.forEach((n,i)=>{next[n.id]=p[i];});
    setPos(next);setZoom(1);setPan({x:0,y:0});
  };

  const getSVGPt=(e:React.MouseEvent)=>{
    const svg=svgRef.current;if(!svg)return{x:0,y:0};
    const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;
    const inv=svg.getScreenCTM()?.inverse();
    const p=inv?pt.matrixTransform(inv):pt;
    return{x:(p.x-pan.x)/zoom,y:(p.y-pan.y)/zoom};
  };
  const onNDown=(e:React.MouseEvent,id:string)=>{
    e.stopPropagation();const p=getSVGPt(e);
    setDrag(id);setDragOff({x:p.x-(pos[id]?.x||0),y:p.y-(pos[id]?.y||0)});
  };
  const onMove=(e:React.MouseEvent)=>{
    if(drag){const p=getSVGPt(e);setPos(prev=>({...prev,[drag]:{x:p.x-dragOff.x,y:p.y-dragOff.y}}));}
    else if(panning)setPan({x:e.clientX-panStart.x,y:e.clientY-panStart.y});
  };
  const onUp=()=>{setDrag(null);setPanning(false);};
  const onSDown=(e:React.MouseEvent)=>{
    const t=e.target as SVGElement;
    if(t===svgRef.current||["rect","svg"].includes(t.tagName)){
      setPanning(true);setPanStart({x:e.clientX-pan.x,y:e.clientY-pan.y});
    }
  };
  const onWheel=(e:React.WheelEvent)=>{e.preventDefault();setZoom(z=>Math.max(0.2,Math.min(4,z-e.deltaY*0.001)));};

  const online=ipbxList.filter(i=>i.status==="online").length;
  const offline=ipbxList.filter(i=>i.status==="offline").length;
  const tUp=trunks.filter(t=>t.status==="up").length;
  const tDown=trunks.filter(t=>t.status==="down").length;
  const activeCh=trunks.reduce((a,t)=>a+(t.channels||0),0);
  const avgLat=trunks.filter(t=>t.latency).length?Math.round(trunks.reduce((a,t)=>a+(t.latency||0),0)/trunks.filter(t=>t.latency).length):null;

  const TT=({x,y,children}:{x:number;y:number;children:React.ReactNode})=>(
    <foreignObject x={x} y={y} width={180} height={120} style={{overflow:"visible"}}>
      <div style={{background:"rgba(3,10,28,0.97)",border:"1px solid rgba(0,229,255,0.25)",borderRadius:7,padding:"7px 11px",fontSize:10,color:"#e2e8f0",whiteSpace:"nowrap",width:"fit-content"}}>
        {children}
      </div>
    </foreignObject>
  );

  const renderTrunks=()=>trunks.map(t=>{
    const src=pos[t.ipbx_id];
    const dst=t.remote_ipbx_id?pos[t.remote_ipbx_id]:null;
    if(!src)return null;
    const style=ts(t.status);
    const isH=hT===t.id;
    const latC=t.latency&&t.latency>100?"#f59e0b":style.c;

    if(!dst){
      const ang=(Object.keys(pos).indexOf(t.ipbx_id)*55)*(Math.PI/180);
      const ex=src.x+Math.cos(ang)*65,ey=src.y+Math.sin(ang)*65;
      return(
        <g key={t.id} onMouseEnter={()=>setHT(t.id)} onMouseLeave={()=>setHT(null)}>
          <line x1={src.x} y1={src.y} x2={ex} y2={ey} stroke={style.c} strokeWidth={isH?2.5:1.5} strokeDasharray={style.d} strokeOpacity={0.65}/>
          <circle cx={ex} cy={ey} r={4} fill={style.c} opacity={0.5}/>
          {t.latency&&<text x={(src.x+ex)/2} y={(src.y+ey)/2-5} fill={style.c} fontSize={8} textAnchor="middle" fontFamily="JetBrains Mono">{t.latency}ms</text>}
          {isH&&<TT x={ex+8} y={ey-10}><div style={{fontWeight:700,color:style.c,marginBottom:3}}>{t.name}</div><div style={{color:"#64748b"}}>Provider: {t.provider||"—"}</div><div style={{color:"#64748b"}}>Canaux: {t.channels??0}/{t.max_channels??30}</div></TT>}
        </g>
      );
    }

    const mx=(src.x+dst.x)/2,my=(src.y+dst.y)/2-55;
    const path=`M ${src.x} ${src.y} Q ${mx} ${my} ${dst.x} ${dst.y}`;
    const prog=((tick*0.0028+(t.ipbx_id.charCodeAt(0)*0.07))%1);
    const px=(1-prog)*(1-prog)*src.x+2*(1-prog)*prog*mx+prog*prog*dst.x;
    const py=(1-prog)*(1-prog)*src.y+2*(1-prog)*prog*my+prog*prog*dst.y;

    return(
      <g key={t.id} onMouseEnter={()=>setHT(t.id)} onMouseLeave={()=>setHT(null)}>
        <path d={path} fill="none" stroke={style.c} strokeWidth={10} strokeOpacity={0.04}/>
        <path d={path} fill="none" stroke={style.c} strokeWidth={5} strokeOpacity={0.08}/>
        <path d={path} fill="none" stroke={latC} strokeWidth={isH?2.5:1.5} strokeDasharray={style.d} strokeOpacity={0.8}/>
        {t.status==="up"&&<>
          <circle cx={px} cy={py} r={3.5} fill={style.c} opacity={0.95}/>
          <circle cx={px} cy={py} r={7} fill={style.c} opacity={0.15}/>
        </>}
        <rect x={mx-20} y={my-9} width={40} height={14} rx={4} fill="rgba(3,10,28,0.85)" stroke={latC} strokeWidth={0.5} strokeOpacity={0.5}/>
        <text x={mx} y={my+1} fill={latC} fontSize={8} textAnchor="middle" fontFamily="JetBrains Mono">{t.latency?`${t.latency}ms`:t.name.slice(0,7)}</text>
        {isH&&<TT x={mx+10} y={my-15}><div style={{fontWeight:700,color:latC,marginBottom:4}}>{t.name}</div><div style={{color:"#64748b"}}>Statut: <span style={{color:style.c}}>{t.status}</span></div><div style={{color:"#64748b"}}>Latence: {t.latency?`${t.latency}ms`:"—"}</div><div style={{color:"#64748b"}}>Canaux: {t.channels??0}/{t.max_channels??30}</div>{t.provider&&<div style={{color:"#64748b"}}>Provider: {t.provider}</div>}</TT>}
      </g>
    );
  });

  const renderNodes=()=>ipbxList.map(ipbx=>{
    const p=pos[ipbx.id];if(!p)return null;
    const n=ns(ipbx.status);
    const isH=hN===ipbx.id,isDrag=drag===ipbx.id;
    const nodeTrunks=trunks.filter(t=>t.ipbx_id===ipbx.id);
    const ch=nodeTrunks.reduce((a,t)=>a+(t.channels||0),0);
    const bars=Math.min(ch,5);
    return(
      <g key={ipbx.id} transform={`translate(${p.x},${p.y})`}
        onMouseDown={e=>onNDown(e,ipbx.id)}
        onMouseEnter={()=>setHN(ipbx.id)} onMouseLeave={()=>setHN(null)}
        style={{cursor:isDrag?"grabbing":"grab"}}>
        {ipbx.status==="online"&&(
          <circle r={45} fill="none" stroke={n.c} strokeWidth={0.5} strokeOpacity={0.1}>
            <animate attributeName="r" values="32;55;32" dur="3.5s" repeatCount="indefinite"/>
            <animate attributeName="stroke-opacity" values="0.25;0;0.25" dur="3.5s" repeatCount="indefinite"/>
          </circle>
        )}
        <circle r={26} fill={n.r}/>
        <circle r={24} fill="none" stroke={n.c} strokeWidth={0.5} strokeOpacity={0.35}/>
        <circle r={20} fill="none" stroke={n.c} strokeWidth={1} strokeOpacity={0.6}/>
        <circle r={16} fill="#030a1c" stroke={n.c} strokeWidth={isH?2:1.5}
          style={{filter:`drop-shadow(0 0 10px ${n.g})`}}/>
        <polygon points="0,-8 7,-4 7,4 0,8 -7,4 -7,-4"
          fill="none" stroke={n.c} strokeWidth={1} strokeOpacity={0.8}/>
        <circle r={2.5} fill={n.c} opacity={0.9}/>
        {ch>0&&Array.from({length:bars}).map((_,i)=>(
          <rect key={i} x={-9+i*4.5} y={-30+(3-i)*-1.5} width={3.5} height={7+i*2.5} rx={1} fill={n.c} opacity={0.35+i*0.13}/>
        ))}
        <circle cx={14} cy={-14} r={3.5} fill={n.c}>
          {ipbx.status==="online"&&<animate attributeName="opacity" values="1;0.25;1" dur="1.6s" repeatCount="indefinite"/>}
        </circle>
        <text y={30} textAnchor="middle" fontSize={10.5} fill="#dde4f0" fontFamily="JetBrains Mono" fontWeight="600">{ipbx.name}</text>
        <text y={41} textAnchor="middle" fontSize={8} fill="#3d5068" fontFamily="JetBrains Mono">{ipbx.ip_address||"—"}</text>
        {ipbx.ping_latency&&<text y={51} textAnchor="middle" fontSize={7.5} fill={n.c} fontFamily="JetBrains Mono" opacity={0.75}>{ipbx.ping_latency}ms</text>}
        {isH&&!isDrag&&(
          <TT x={24} y={-25}>
            <div style={{fontWeight:700,fontSize:11,color:n.c,marginBottom:5}}>{ipbx.name}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 10px",color:"#64748b"}}>
              <span>Statut</span><span style={{color:n.c}}>{ipbx.status}</span>
              <span>IP</span><span style={{color:"#94a3b8"}}>{ipbx.ip_address||"—"}</span>
              <span>Ping</span><span style={{color:"#94a3b8"}}>{ipbx.ping_latency?`${ipbx.ping_latency}ms`:"—"}</span>
              <span>Trunks</span><span style={{color:"#94a3b8"}}>{nodeTrunks.length}</span>
              <span>Canaux</span><span style={{color:"#94a3b8"}}>{ch}</span>
            </div>
          </TT>
        )}
      </g>
    );
  });

  const cs:React.CSSProperties=full?{position:"fixed",inset:0,zIndex:9999,background:"#020a1b",display:"flex",flexDirection:"column",padding:16}:{};
  const stats=[
    {l:"IPBX Online",v:online,c:"#00e5ff"},
    {l:"IPBX Offline",v:offline,c:"#ff3d57"},
    {l:"Trunks UP",v:`${tUp}/${tUp+tDown}`,c:"#00e5ff"},
    {l:"Latence moy.",v:avgLat?`${avgLat}ms`:"—",c:avgLat&&avgLat>100?"#f59e0b":"#00e5ff"},
    {l:"Canaux actifs",v:activeCh,c:"#f59e0b"},
  ];

  return(
    <div style={cs}>
      <div className={full?"":"space-y-3"} style={full?{display:"flex",flexDirection:"column",gap:12,height:"100%"}:{}}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Activity size={18} className="text-primary"/> Network Map
            </h1>
            <p className="text-xs text-muted-foreground font-mono">Topologie VoIP temps réel</p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            {[{l:`${online} online`,bg:"rgba(0,229,255,0.08)",c:"#00e5ff",show:true},
              {l:`${offline} offline`,bg:"rgba(255,61,87,0.08)",c:"#ff3d57",show:offline>0},
              {l:`${tUp}/${tUp+tDown} trunks UP`,bg:"rgba(0,229,255,0.06)",c:"#00e5ff",show:true},
            ].filter(p=>p.show).map(p=>(
              <div key={p.l} style={{background:p.bg,border:`1px solid ${p.c}33`,color:p.c,borderRadius:20,padding:"3px 11px",fontSize:11,fontFamily:"JetBrains Mono",fontWeight:600}}>
                {p.l}
              </div>
            ))}
            <div style={{display:"flex",gap:5}}>
              {[{I:ZoomIn,a:()=>setZoom(z=>Math.min(4,z+0.25))},
                {I:ZoomOut,a:()=>setZoom(z=>Math.max(0.2,z-0.25))},
                {I:RotateCcw,a:resetLayout},
                {I:RefreshCw,a:fetchData},
                {I:Maximize2,a:()=>setFull(f=>!f)},
              ].map(({I,a},i)=>(
                <button key={i} onClick={a} style={{width:30,height:30,borderRadius:6,border:"1px solid rgba(0,229,255,0.15)",background:"rgba(0,229,255,0.04)",color:"#64748b",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                  <I size={13}/>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div style={{position:"relative",borderRadius:12,overflow:"hidden",border:"1px solid rgba(0,229,255,0.1)",background:"linear-gradient(150deg,#020a1b,#030d1f,#040f23)",flex:full?1:undefined}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,229,255,0.012) 3px,rgba(0,229,255,0.012) 4px)",pointerEvents:"none",zIndex:1}}/>
          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.2}}>
            <defs>
              <pattern id="gsm" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0L0 0 0 28" fill="none" stroke="#0b1e38" strokeWidth="0.5"/></pattern>
              <pattern id="glg" width="112" height="112" patternUnits="userSpaceOnUse"><path d="M112 0L0 0 0 112" fill="none" stroke="#0d2244" strokeWidth="0.8"/></pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gsm)"/>
            <rect width="100%" height="100%" fill="url(#glg)"/>
          </svg>
          {loading&&!ipbxList.length?(
            <div style={{height:480,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:2}}>
              <div style={{textAlign:"center"}}>
                <div style={{width:38,height:38,border:"2px solid rgba(0,229,255,0.15)",borderTop:"2px solid #00e5ff",borderRadius:"50%",animation:"nspin 1s linear infinite",margin:"0 auto 12px"}}/>
                <p style={{color:"#3d5068",fontSize:12,fontFamily:"JetBrains Mono"}}>Chargement topologie...</p>
              </div>
            </div>
          ):ipbxList.length===0?(
            <div style={{height:480,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:2}}>
              <p style={{color:"#3d5068",fontSize:13}}>Aucun IPBX configuré</p>
            </div>
          ):(
            <svg ref={svgRef} width="100%" height={full?"calc(100vh - 200px)":480}
              viewBox={`0 0 ${W} ${H}`}
              style={{cursor:panning?"grabbing":"default",position:"relative",zIndex:2}}
              onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
              onMouseDown={onSDown} onWheel={onWheel}>
              <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
                {renderTrunks()}{renderNodes()}
              </g>
            </svg>
          )}
          <div style={{position:"absolute",bottom:10,right:12,zIndex:3,background:"rgba(3,10,28,0.85)",border:"1px solid rgba(0,229,255,0.12)",borderRadius:5,padding:"3px 8px",fontSize:10,color:"#3d5068",fontFamily:"JetBrains Mono"}}>
            {Math.round(zoom*100)}%
          </div>
        </div>

        {/* Stats bar */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8}}>
          {stats.map(s=>(
            <div key={s.l} style={{background:"rgba(3,10,28,0.85)",border:"1px solid rgba(0,229,255,0.08)",borderRadius:10,padding:"10px 14px"}}>
              <p style={{fontSize:9,color:"#3d5068",fontFamily:"JetBrains Mono",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{s.l}</p>
              <p style={{fontSize:21,fontWeight:700,color:s.c,fontFamily:"JetBrains Mono",lineHeight:1}}>{s.v}</p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{display:"flex",gap:18,fontSize:10,color:"#3d5068",fontFamily:"JetBrains Mono",flexWrap:"wrap"}}>
          {[{c:"#00e5ff",l:"Online / UP"},{c:"#ff3d57",l:"Offline / DOWN"},{c:"#f59e0b",l:"Latence > 100ms"}].map(x=>(
            <div key={x.l} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:18,height:2,background:x.c,borderRadius:1}}/>{x.l}
            </div>
          ))}
          <span style={{marginLeft:"auto",opacity:0.5}}>Glisser nœuds · Molette zoomer · Drag fond = panoramique</span>
        </div>
      </div>
      <style>{`@keyframes nspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};
export default NetworkMap;
