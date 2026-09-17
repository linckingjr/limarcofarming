// Lightweight Firebase-ready forum UI
// Requires you to create firebase-config.js exporting default config object.
import firebaseConfig from './firebase-config.js';

let firebaseApp, db;

async function initFirebase(){
  try{
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.24.0/firebase-app.js');
    const { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/9.24.0/firebase-firestore.js');
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);

    const postsCol = collection(db,'posts');
    const q = query(postsCol, orderBy('created','desc'));
    onSnapshot(q, snap=>{
      const postsList = document.getElementById('posts-list');
      postsList.innerHTML='';
      snap.forEach(doc=>{
        const data = doc.data();
        const el = document.createElement('article');
        el.className='post';
        el.innerHTML = `<h4>${escapeHtml(data.title)}</h4><p class="muted">by ${escapeHtml(data.author)} — ${new Date(data.created.seconds*1000).toLocaleString()}</p><p>${escapeHtml(data.body)}</p>`;
        postsList.appendChild(el);
      });
    });

    document.getElementById('new-post-form').addEventListener('submit', async e=>{
      e.preventDefault();
      const author = document.getElementById('post-author').value.trim();
      const title = document.getElementById('post-title').value.trim();
      const body = document.getElementById('post-body').value.trim();
      if(!author||!title||!body) return;
      await addDoc(postsCol, {author,title,body,created:serverTimestamp()});
      e.target.reset();
    });
  }catch(err){
    console.warn('Firebase not configured or blocked.',err);
    const root = document.getElementById('forum-root');
    if(root) root.querySelector('#forum-app').innerHTML = '<p><em>Firebase not configured. See README to enable forum.</em></p>';
  }
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'":"&#39;'}[c])); }

initFirebase();
