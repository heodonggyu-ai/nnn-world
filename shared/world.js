/* NNN 월드 공통 모듈: Firebase 연결, 별명+비밀번호(숫자 4자리) 계정, 세션, 저장, 방(초대코드) */
(function(){
  const FB_CONFIG={
    apiKey:"AIzaSyDw7t6dzGDMJM-EvNsnE0IcEpluI8OqAMs",
    authDomain:"nnn-world.firebaseapp.com",
    databaseURL:"https://nnn-world-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId:"nnn-world",
    storageBucket:"nnn-world.firebasestorage.app",
    messagingSenderId:"511664724682",
    appId:"1:511664724682:web:41ef735c3d4b4ed03ff233"
  };
  const SKEY='nnnw_session';
  let readyP=null,db=null,auth=null;
  const hasFb=()=>typeof firebase!=='undefined';
  function ready(){
    if(readyP)return readyP;
    if(!hasFb())return readyP=Promise.reject(new Error('offline'));
    if(!firebase.apps.length)firebase.initializeApp(FB_CONFIG);
    auth=firebase.auth();db=firebase.database();
    readyP=new Promise((res,rej)=>{
      const t=setTimeout(()=>rej(new Error('timeout')),12000);
      const un=auth.onAuthStateChanged(u=>{un();if(u){clearTimeout(t);res(u)}else auth.signInAnonymously().then(c=>{clearTimeout(t);res(c.user)}).catch(e=>{clearTimeout(t);rej(e)})});
    });
    return readyP;
  }
  const validNick=n=>/^[가-힣a-zA-Z0-9]{2,8}$/.test(n||'');
  const validPin=p=>/^[0-9]{4}$/.test(p||'');
  const keyOf=n=>n.toLowerCase();
  function session(){try{const s=JSON.parse(localStorage.getItem(SKEY)||'null');return s&&s.key?s:null}catch(e){return null}}
  function setSession(s){try{if(s)localStorage.setItem(SKEY,JSON.stringify(s));else localStorage.removeItem(SKEY)}catch(e){}}
  function errMsg(e){const c=(e&&(e.code||e.message)||'')+'';
    if(/PERMISSION_DENIED|permission/i.test(c))return 'denied';
    if(/offline|timeout|network/i.test(c))return 'network';
    return 'unknown'}
  async function signup(nick,pin,char){
    nick=(nick||'').trim();
    if(!validNick(nick))throw{msg:'별명은 한글, 영어, 숫자로 2~8글자로 지어 주세요.'};
    if(!validPin(pin))throw{msg:'비밀번호는 숫자 4개로 정해 주세요.'};
    const u=await ready().catch(()=>{throw{msg:'인터넷 연결을 확인해 주세요.'}});
    const k=keyOf(nick);
    try{await db.ref('pins/'+k).set(pin)}catch(e){throw{msg:errMsg(e)==='denied'?'이미 누가 쓰고 있는 별명이에요. 다른 별명을 지어 볼까요?':'잠시 후 다시 해 주세요.'}}
    await db.ref('devices/'+k+'/'+u.uid).set({pin});
    const prof={nick,char:char||'mingnyu',wear:{},created:firebase.database.ServerValue.TIMESTAMP};
    await db.ref('profiles/'+k).set(prof);
    const s={key:k,nick,char:prof.char};setSession(s);return s;
  }
  async function login(nick,pin){
    nick=(nick||'').trim();
    if(!validNick(nick)||!validPin(pin))throw{msg:'별명과 비밀번호 숫자 4개를 확인해 주세요.'};
    const u=await ready().catch(()=>{throw{msg:'인터넷 연결을 확인해 주세요.'}});
    const k=keyOf(nick);
    try{await db.ref('devices/'+k+'/'+u.uid).set({pin})}catch(e){throw{msg:errMsg(e)==='denied'?'별명이나 비밀번호가 맞지 않아요.':'잠시 후 다시 해 주세요.'}}
    const snap=await db.ref('profiles/'+k).get();const p=snap.val()||{nick};
    const s={key:k,nick:p.nick||nick,char:p.char||'mingnyu'};setSession(s);return s;
  }
  function logout(){setSession(null)}
  async function profile(k){await ready();const s=await db.ref('profiles/'+(k||session().key)).get();return s.val()}
  async function updateProfile(patch){const s=session();if(!s)return;await ready();await db.ref('profiles/'+s.key).update(patch);if(patch.char){s.char=patch.char;setSession(s)}}
  async function loadSave(game){const s=session();if(!s)return null;await ready();const v=(await db.ref('saves/'+s.key+'/'+game).get()).val();return v}
  async function saveGame(game,data){const s=session();if(!s)return;await ready();await db.ref('saves/'+s.key+'/'+game).set({t:Date.now(),data})}
  async function createRoom(game){
    const s=session();if(!s)throw{msg:'먼저 로그인해 주세요.'};await ready();
    for(let i=0;i<6;i++){const code=String(Math.floor(100000+Math.random()*900000));
      try{await db.ref('rooms/'+code+'/host').set(s.key);await db.ref('rooms/'+code+'/game').set(game);await db.ref('rooms/'+code+'/created').set(firebase.database.ServerValue.TIMESTAMP);return code}catch(e){}}
    throw{msg:'방을 만들지 못했어요. 잠시 후 다시 해 주세요.'};
  }
  async function roomGame(code){if(!/^[0-9]{6}$/.test(code||''))return null;await ready();return (await db.ref('rooms/'+code+'/game').get()).val()}
  function ref(path){return db.ref(path)}
  window.World={ADMIN_KEY:'밍뉴',ready,session,setSession,signup,login,logout,profile,updateProfile,loadSave,saveGame,createRoom,roomGame,ref,validNick,validPin,
    serverTime:()=>firebase.database.ServerValue.TIMESTAMP,available:hasFb};
})();
