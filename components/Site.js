"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const demoSongs = [
  {id:"demo1",title:"Khatra DJ Demo Song",artist:"KhatraDJ",category:"DJ Song",cover:"",audio_url:"",downloads:0,approved:true},
  {id:"demo2",title:"New Nagpuri DJ Mix",artist:"Various Artist",category:"Nagpuri",cover:"",audio_url:"",downloads:0,approved:true}
];

export default function Site(){
  const [songs,setSongs]=useState(demoSongs);
  const [q,setQ]=useState("");
  const [category,setCategory]=useState("All");
  const [message,setMessage]=useState("");
  const [admin,setAdmin]=useState(false);
  const [pending,setPending]=useState([]);

  async function loadSongs(){
    if(!supabase){return;}
    const {data}=await supabase.from("songs").select("*").eq("approved",true).order("created_at",{ascending:false});
    if(data) setSongs(data);
  }
  async function loadPending(){
    if(!supabase){return;}
    const {data}=await supabase.from("songs").select("*").eq("approved",false).order("created_at",{ascending:false});
    if(data) setPending(data);
  }
  useEffect(()=>{loadSongs()},[]);

  const cats=["All","DJ Song","Nagpuri","Bhakti","Bhojpuri","Hindi"];
  const filtered=useMemo(()=>songs.filter(s=>(category==="All"||s.category===category)&&(`${s.title} ${s.artist}`.toLowerCase().includes(q.toLowerCase()))),[songs,q,category]);

  async function download(song){
    if(supabase) await supabase.rpc("increment_downloads",{song_id:song.id});
    setSongs(x=>x.map(s=>s.id===song.id?{...s,downloads:(s.downloads||0)+1}:s));
    if(song.audio_url) window.open(song.audio_url,"_blank");
    else setMessage("Demo song: audio file link abhi add nahi kiya gaya.");
  }

  async function submit(e){
    e.preventDefault();
    if(!supabase){setMessage("Supabase connect karne ke baad uploads live honge. README me setup diya hai.");return;}
    const f=new FormData(e.currentTarget);
    const audio=f.get("audio"), cover=f.get("cover");
    const safe=(name)=>name.replace(/[^a-zA-Z0-9._-]/g,"_");
    const audioPath=`songs/${Date.now()}-${safe(audio.name)}`;
    const coverPath=cover?.name?`covers/${Date.now()}-${safe(cover.name)}`:null;
    let r=await supabase.storage.from("songs").upload(audioPath,audio);
    if(r.error){setMessage(r.error.message);return;}
    let coverUrl="";
    if(coverPath){
      r=await supabase.storage.from("songs").upload(coverPath,cover);
      if(!r.error) coverUrl=supabase.storage.from("songs").getPublicUrl(coverPath).data.publicUrl;
    }
    const audioUrl=supabase.storage.from("songs").getPublicUrl(audioPath).data.publicUrl;
    const {error}=await supabase.from("songs").insert({title:f.get("title"),artist:f.get("artist"),category:f.get("category"),audio_url:audioUrl,cover_url:coverUrl,approved:false,downloads:0});
    setMessage(error?error.message:"Song submit ho gaya. Admin approval ke baad website par dikhega.");
    if(!error)e.currentTarget.reset();
  }

  async function approve(id){
    const {error}=await supabase.from("songs").update({approved:true}).eq("id",id);
    if(!error){setPending(p=>p.filter(x=>x.id!==id));loadSongs();}
  }

  return <main>
    <header className="top"><div className="container nav">
      <a className="logo" href="#">Khatra<span>DJ.com</span></a>
      <nav className="navlinks"><a href="#songs">Songs</a><a href="#upload">Upload Your Song</a><a href="#admin">Admin</a></nav>
    </div></header>

    <section className="hero"><div className="container">
      <div className="badge">🎵 DJ • Nagpuri • Bhakti • New Songs</div>
      <h1>KhatraDJ.com</h1>
      <p>Apne favourite songs suno, search karo aur authorized songs download karo.</p>
      <div className="search"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Song ya artist search kare..." /><button className="btn" onClick={()=>document.getElementById("songs")?.scrollIntoView()}>Search</button></div>
    </div></section>

    <section className="section" id="songs"><div className="container">
      <div className="sectionhead"><h2>🎶 Download Songs</h2><span className="muted">{filtered.length} songs</span></div>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:12}}>{cats.map(c=><button key={c} className={"btn "+(category===c?"":"secondary")} onClick={()=>setCategory(c)}>{c}</button>)}</div>
      <div className="grid">{filtered.map(s=><article className="card" key={s.id}>
        <div className="cover">{s.cover_url||s.cover?<img src={s.cover_url||s.cover} alt="cover"/>:"🎵"}</div>
        <div className="title">{s.title}</div><div className="artist">{s.artist||"Unknown Artist"} • {s.category}</div>
        <div className="actions">{s.audio_url?<a className="btn secondary" href={s.audio_url} target="_blank">▶ Play</a>:<button className="btn secondary" onClick={()=>setMessage("Demo song me audio URL nahi hai.")}>▶ Play</button>}<button className="btn" onClick={()=>download(s)}>⬇ Download</button></div>
        <div className="downloads">⬇ {s.downloads||0} downloads</div>
      </article>)}</div>
      {!filtered.length&&<div className="empty">Koi song nahi mila.</div>}
    </div></section>

    <section className="section" id="upload"><div className="container">
      <div className="sectionhead"><h2>📤 Upload Your Song</h2></div>
      <form className="formbox" onSubmit={submit}>
        <div className="notice">Sirf apne ya authorized songs upload karein. Submit ke baad admin approval zaroori hai.</div>
        {message&&<div className="notice">{message}</div>}
        <div className="field"><label>Song Title</label><input name="title" required placeholder="Song ka naam"/></div>
        <div className="field"><label>Artist / Singer</label><input name="artist" required placeholder="Artist name"/></div>
        <div className="field"><label>Category</label><select name="category" defaultValue="DJ Song">{cats.filter(x=>x!=="All").map(x=><option key={x}>{x}</option>)}</select></div>
        <div className="field"><label>Song File (MP3)</label><input name="audio" type="file" accept="audio/mpeg,audio/*" required/></div>
        <div className="field"><label>Cover Photo</label><input name="cover" type="file" accept="image/*"/></div>
        <button className="btn" style={{width:"100%"}}>📤 Submit Song</button>
      </form>
    </div></section>

    <section className="section" id="admin"><div className="container">
      <div className="sectionhead"><h2>🔐 Admin Approval</h2></div>
      {!admin?<div className="formbox"><div className="notice">Demo admin panel. Production me proper Supabase Auth + admin role use karein.</div><button className="btn" onClick={()=>{setAdmin(true);loadPending()}}>Open Admin</button></div>:
      <div className="formbox">{pending.length?<>{pending.map(s=><div key={s.id} style={{borderBottom:"1px solid #2b2f39",padding:"12px 0"}}><b>{s.title}</b><div className="muted">{s.artist} • {s.category}</div><button className="btn" style={{marginTop:8}} onClick={()=>approve(s.id)}>Approve</button></div>)}</>:<div className="empty">No pending songs.</div>}</div>}
    </div></section>

    <footer className="footer"><div className="container">© 2026 KhatraDJ.com • Upload • Play • Download</div></footer>
  </main>
}