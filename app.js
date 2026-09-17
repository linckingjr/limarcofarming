// Minimal client-side store and UI interactions
let products = [];
const productsEl = document.getElementById('products');
const cartList = document.getElementById('cart-list');
const cartTotal = document.getElementById('cart-total');
const headerLogin = document.getElementById('header-login');
const profileMenu = document.getElementById('profile-menu');
const profileTrigger = document.getElementById('profile-trigger');
const profileDropdown = document.getElementById('profile-dropdown');
let cart = [];
const catalogues = [
  {
    name: 'Farm House Catalogue',
    file: '',
    description: 'Updated PDF catalogue'
  },
  {
    name: 'Animals Catalogue',
    file: '',
    description: 'Updated PDF catalogue'
  },
  {
    name: 'Hardware Catalogue',
    file: '',
    description: 'Updated PDF catalogue'
  }
];

// restore cart from localStorage
try{ const saved = localStorage.getItem('limarco_cart'); if(saved) cart = JSON.parse(saved);}catch(e){}

function setAuthState(isAuthenticated){
  if(!headerLogin || !profileMenu || !profileTrigger || !profileDropdown) return;

  if(isAuthenticated){
    headerLogin.hidden = true;
    profileMenu.hidden = false;
    profileTrigger.setAttribute('aria-expanded', 'false');
    profileDropdown.classList.remove('open');
  } else {
    headerLogin.hidden = false;
    profileMenu.hidden = true;
    profileTrigger.setAttribute('aria-expanded', 'false');
    profileDropdown.classList.remove('open');
  }
}

headerLogin?.addEventListener('click', ()=> setAuthState(true));
profileTrigger?.addEventListener('click', (event)=>{
  event.stopPropagation();
  const isOpen = profileDropdown.classList.contains('open');
  profileDropdown.classList.toggle('open', !isOpen);
  profileTrigger.setAttribute('aria-expanded', String(!isOpen));
});

document.addEventListener('click', (event)=>{
  if(profileMenu && !profileMenu.contains(event.target)){
    profileDropdown?.classList.remove('open');
    profileTrigger?.setAttribute('aria-expanded', 'false');
  }
});

window.LIMARCO_AUTH = { setAuthState, isAuthenticated: false };
setAuthState(false);
// Create floating cart UI (icon + small panel) and ensure elements exist before rendering
function createFloatingCartUI(){
  if(document.getElementById('floating-cart-root')) return;
  const wrapper = document.createElement('div');
  wrapper.id = 'floating-cart-root';
  wrapper.className = 'floating-cart';
  wrapper.innerHTML = `
    <div id="catalogue-widget" class="catalogue-widget" role="complementary" aria-label="Catalogue downloads">
      <button id="catalogue-widget-toggle" class="catalogue-widget-toggle" type="button" aria-label="Download catalogues" aria-expanded="false" title="Download Catalogues">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M7 3.5h7l5 5V18a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18V6a2.5 2.5 0 0 1 2.5-2.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 3.5V9h5M9 13.5h6M9 17h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        </svg>
      </button>

      <div id="catalogue-widget-panel" class="catalogue-widget-panel" role="dialog" aria-label="Available catalogues" aria-hidden="true">
        <div class="catalogue-widget-header">
          <h4>OUR CATALOGUES</h4>
          <button id="catalogue-widget-close" class="catalogue-widget-close" type="button" aria-label="Close catalogues">×</button>
        </div>
        <div id="catalogue-list" class="catalogue-list" aria-live="polite"></div>
      </div>
    </div>

    <button id="floating-cart-btn" class="floating-cart-button" aria-label="Shopping cart" aria-expanded="false">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6h15l-1.5 9h-11L6 6z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="10" cy="20" r="1" fill="currentColor"/>
        <circle cx="18" cy="20" r="1" fill="currentColor"/>
      </svg>
      <span id="floating-cart-badge" class="floating-cart-badge">0</span>
    </button>
    <div id="floating-cart-panel" class="floating-cart-panel" role="dialog" aria-label="Shopping cart panel" aria-hidden="true">
      <div class="floating-cart-header"><h4>CART</h4><button id="floating-cart-close" aria-label="Close cart" style="background:transparent;border:0;font-size:18px;cursor:pointer">×</button></div>
      <div class="floating-cart-body">
        <ul id="floating-cart-list" class="floating-cart-list" aria-live="polite"></ul>
        <p class="floating-cart-empty">Your cart is empty</p>
      </div>
      <div class="floating-cart-footer">
        <p>Total: <span id="floating-cart-total">$0.00</span></p>
        <button id="floating-checkout" class="btn-primary">CHECKOUT</button>
      </div>
    </div>

    <div id="chat-widget" class="chat-widget" role="complementary" aria-label="Customer support chat">
      <button id="chat-widget-toggle" class="chat-widget-toggle" type="button" aria-label="Chat with us" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M7 18.5 3.5 21V6.5A2.5 2.5 0 0 1 6 4h12a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 18 17H7Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 9h8M8 12h5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        </svg>
      </button>

      <div id="chat-widget-popup" class="chat-widget-popup" role="dialog" aria-label="Customer support chat" aria-hidden="true">
        <div class="chat-widget-header">
          <div class="chat-widget-header-copy">
            <div class="chat-widget-badge" aria-hidden="true">
              <span class="chat-widget-badge-dot"></span>
            </div>
            <div>
              <p class="chat-widget-kicker">Chat with us</p>
              <h4>We're here to help.</h4>
            </div>
          </div>
          <button id="chat-widget-close" class="chat-widget-close" type="button" aria-label="Close chat">×</button>
        </div>

        <div id="chat-widget-picker" class="chat-widget-screen chat-widget-screen--active">
          <button type="button" class="chat-option chat-admin-option" data-chat-mode="admin" aria-label="Chat with admin">
            <span class="chat-option-icon" aria-hidden="true">💬</span>
            <span class="chat-option-text">
              <strong>CHAT WITH ADMIN</strong>
              <small>Send us a message directly through our website.</small>
            </span>
          </button>

          <a class="chat-option whatsapp-option" href="https://wa.me/263771752516?text=Hello%20LIMARCO%20Farming%2C%20I%20need%20help%20with%20your%20products%20or%20services." target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
            <span class="chat-option-icon" aria-hidden="true">✆</span>
            <span class="chat-option-text">
              <strong>WHATSAPP</strong>
              <small>Continue the conversation on WhatsApp.</small>
            </span>
          </a>
        </div>

        <div id="chat-widget-admin" class="chat-widget-screen chat-widget-screen--admin" hidden aria-live="polite">
          <div class="chat-admin-toolbar">
            <button type="button" class="chat-back-button" id="chat-back-button" aria-label="Back to support options">← Back</button>
            <span class="chat-admin-label">Support</span>
          </div>
          <div class="chat-messages" id="chat-messages">
            <div class="chat-message chat-message-admin">
              <span class="chat-message-name">Admin</span>
              <p>Hello! How can we help you today?</p>
            </div>
          </div>
          <form id="chat-form" class="chat-form" aria-label="Chat form">
            <label class="sr-only" for="chat-message-input">Write your message</label>
            <input id="chat-message-input" type="text" placeholder="Write your message..." aria-label="Write your message" autocomplete="off" />
            <button type="submit" aria-label="Send message">➤</button>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  const btn = document.getElementById('floating-cart-btn');
  const panel = document.getElementById('floating-cart-panel');
  const closeBtn = document.getElementById('floating-cart-close');
  const catalogueToggle = document.getElementById('catalogue-widget-toggle');
  const cataloguePanel = document.getElementById('catalogue-widget-panel');
  const catalogueClose = document.getElementById('catalogue-widget-close');
  const catalogueList = document.getElementById('catalogue-list');
  const chatToggle = document.getElementById('chat-widget-toggle');
  const chatPopup = document.getElementById('chat-widget-popup');
  const chatClose = document.getElementById('chat-widget-close');
  const chatPicker = document.getElementById('chat-widget-picker');
  const chatAdminScreen = document.getElementById('chat-widget-admin');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-message-input');
  const chatMessages = document.getElementById('chat-messages');
  const chatBack = document.getElementById('chat-back-button');
  if(panel) panel.tabIndex = -1;

  function renderCatalogueList(){
    if(!catalogueList) return;
    catalogueList.innerHTML = '';

    if(!catalogues.length){
      const empty = document.createElement('div');
      empty.className = 'catalogue-empty';
      empty.textContent = 'No catalogues are configured yet.';
      catalogueList.appendChild(empty);
      return;
    }

    catalogues.forEach((entry) => {
      const item = document.createElement('div');
      item.className = 'catalogue-item';

      const hasFile = typeof entry.file === 'string' && entry.file.trim().length > 0;
      const fileUrl = hasFile ? entry.file.trim() : '';

      item.innerHTML = `
        <div class="catalogue-item-main">
          <span class="catalogue-item-icon" aria-hidden="true">📄</span>
          <div class="catalogue-item-copy">
            <h5>${entry.name || 'Catalogue'}</h5>
            <p>${entry.description || 'Updated PDF catalogue'}</p>
          </div>
        </div>
        <div class="catalogue-item-actions">
          <button type="button" class="catalogue-view-btn" ${hasFile ? '' : 'disabled'} data-file="${fileUrl}">VIEW</button>
          <a href="${fileUrl || '#'}" class="catalogue-download-btn" ${hasFile ? '' : 'aria-disabled="true" tabindex="-1"'} ${hasFile ? 'download' : 'onclick="return false;"'}>${hasFile ? 'DOWNLOAD' : 'UNAVAILABLE'}</a>
        </div>
      `;

      const viewBtn = item.querySelector('.catalogue-view-btn');
      const downloadBtn = item.querySelector('.catalogue-download-btn');

      if(viewBtn && hasFile){
        viewBtn.addEventListener('click', () => {
          if (!fileUrl) return;
          window.open(fileUrl, '_blank', 'noopener,noreferrer');
        });
      }

      if(downloadBtn && hasFile){
        downloadBtn.addEventListener('click', (event) => {
          if (!fileUrl) {
            event.preventDefault();
            return;
          }
          const a = document.createElement('a');
          a.href = fileUrl;
          a.download = fileUrl.split('/').pop() || `${(entry.name || 'catalogue').replace(/\s+/g, '-').toLowerCase()}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        });
      }

      catalogueList.appendChild(item);
    });
  }

  function updateFloatingActionPositions(){
    const floatingButtons = [
      { key: 'catalogue', button: catalogueToggle, popup: cataloguePanel },
      { key: 'cart', button: btn, popup: panel },
      { key: 'chat', button: chatToggle, popup: chatPopup }
    ];

    const activeEntry = floatingButtons.find(({ popup }) => popup && popup.classList.contains('open'));

    if (!activeEntry) {
      floatingButtons.forEach(({ button }) => {
        if (button) button.style.transform = 'translateY(0)';
      });
      return;
    }

    const popupHeight = activeEntry.popup.offsetHeight || 0;
    const activeTop = activeEntry.button.getBoundingClientRect().top;
    const viewportHeadroom = Math.max(0, window.innerHeight - activeTop - 70);
    const shift = Math.min(Math.max(16, popupHeight + 18), Math.max(16, viewportHeadroom));

    floatingButtons.forEach(({ button }) => {
      if (!button) return;
      if (button === activeEntry.button) {
        button.style.transform = 'translateY(0)';
        return;
      }
      button.style.transform = `translateY(-${shift}px)`;
    });
  }

  function openCataloguePanel(){
    cataloguePanel.classList.add('open');
    catalogueToggle.setAttribute('aria-expanded', 'true');
    cataloguePanel.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(updateFloatingActionPositions);
  }

  function closeCataloguePanel(){
    cataloguePanel.classList.remove('open');
    catalogueToggle.setAttribute('aria-expanded', 'false');
    cataloguePanel.setAttribute('aria-hidden', 'true');
    requestAnimationFrame(updateFloatingActionPositions);
  }

  function openPanel(){ panel.classList.add('open'); btn.setAttribute('aria-expanded','true'); panel.setAttribute('aria-hidden','false'); panel.focus?.(); requestAnimationFrame(updateFloatingActionPositions); }
  function closePanel(){ panel.classList.remove('open'); btn.setAttribute('aria-expanded','false'); panel.setAttribute('aria-hidden','true'); requestAnimationFrame(updateFloatingActionPositions); }
  function togglePanel(){ panel.classList.contains('open')? closePanel() : openPanel(); }

  function setChatOpen(open){
    wrapper.classList.toggle('chat-open', open);
    chatPopup.classList.toggle('open', open);
    chatPopup.setAttribute('aria-hidden', String(!open));
    chatToggle.setAttribute('aria-expanded', String(open));
    if(open){
      chatInput?.focus();
    }
    requestAnimationFrame(updateFloatingActionPositions);
  }

  function setChatScreen(screen){
    const isPicker = screen === 'picker';
    chatPicker.hidden = !isPicker;
    chatAdminScreen.hidden = isPicker;
    chatPicker.classList.toggle('chat-widget-screen--active', isPicker);
    chatAdminScreen.classList.toggle('chat-widget-screen--active', !isPicker);
  }

  function appendChatMessage(name, text, isAdmin = false){
    const item = document.createElement('div');
    item.className = `chat-message ${isAdmin ? 'chat-message-admin' : 'chat-message-user'}`;
    item.innerHTML = `<span class="chat-message-name">${name}</span><p>${text}</p>`;
    chatMessages.appendChild(item);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function handleChatSubmit(event){
    event.preventDefault();
    const text = chatInput.value.trim();
    if(!text) return;
    appendChatMessage('You', text, false);
    chatInput.value = '';

    const responses = [
      'Thanks for contacting LIMARCO Farming. A support agent will review your message and follow up soon.',
      'We have received your message and will help with your product or farm support enquiry.',
      'Please share any order details or questions you have so we can assist you quickly.'
    ];

    window.setTimeout(() => {
      const reply = responses[Math.floor(Math.random() * responses.length)];
      appendChatMessage('Admin', reply, true);
    }, 500);
  }

  catalogueToggle.addEventListener('click', (e)=>{ e.stopPropagation(); if(cataloguePanel.classList.contains('open')){ closeCataloguePanel(); } else { closePanel(); closeChatIfOpen(); openCataloguePanel(); } });
  catalogueClose.addEventListener('click', (e)=>{ e.stopPropagation(); closeCataloguePanel(); });

  renderCatalogueList();

  btn.addEventListener('click', (e)=>{ e.stopPropagation(); btn.animate([{transform:'translateY(0)'},{transform:'translateY(-6px)'},{transform:'translateY(0)'}],{duration:240}); togglePanel(); if (chatPopup.classList.contains('open')) setChatOpen(false); });
  closeBtn.addEventListener('click', (e)=>{ e.stopPropagation(); closePanel(); });

  function closeChatIfOpen(){ if(chatPopup.classList.contains('open')) setChatOpen(false); }

  chatToggle.addEventListener('click', (e)=>{ e.stopPropagation(); if (chatPopup.classList.contains('open')) { setChatOpen(false); } else { closeCataloguePanel(); setChatOpen(true); setChatScreen('picker'); } });
  chatClose.addEventListener('click', (e)=>{ e.stopPropagation(); setChatOpen(false); });
  chatBack.addEventListener('click', ()=> setChatScreen('picker'));

  chatPicker.querySelectorAll('[data-chat-mode]').forEach((option) => {
    option.addEventListener('click', () => {
      if (option.dataset.chatMode === 'admin') {
        setChatScreen('admin');
        if (!chatMessages.querySelector('.chat-message-admin')) {
          appendChatMessage('Admin', 'Hello! How can we help you today?', true);
        }
      }
    });
  });

  chatForm.addEventListener('submit', handleChatSubmit);

  document.addEventListener('click', (ev)=>{
    if(!panel.classList.contains('open')) return;
    if(!wrapper.contains(ev.target)) closePanel();
  });

  document.addEventListener('click', (ev)=>{
    if(!cataloguePanel.classList.contains('open')) return;
    if(!wrapper.contains(ev.target)) closeCataloguePanel();
  });

  document.addEventListener('click', (ev)=>{
    if(!chatPopup.classList.contains('open')) return;
    if(!wrapper.contains(ev.target)) setChatOpen(false);
  });

  document.addEventListener('keydown', (ev)=>{
    if(ev.key==='Escape') {
      closePanel();
      closeCataloguePanel();
      setChatOpen(false);
    }
  });

  window.addEventListener('resize', updateFloatingActionPositions);

  document.getElementById('floating-checkout')?.addEventListener('click', ()=>{
    const existing = document.getElementById('checkout');
    if(existing) existing.click(); else { window.alert('Proceeding to checkout'); }
  });
}

createFloatingCartUI();
// ensure cart UI reflects restored cart
renderCart();

fetch('products.json').then(r=>r.json()).then(data=>{products=data;renderProducts(products)}).catch(()=>{products=[];productsEl.innerHTML='<p>Unable to load products.json</p>'});
// load blog preview from blog.json (mirrors Wix blog)
fetch('blog.json').then(r=>r.json()).then(posts=>{
  const blogList = document.getElementById('blog-list');
  if(!blogList) return;
  posts.forEach(p=>{
    const card = document.createElement('div');
    card.className='blog-card';
    card.innerHTML = `<img src="${p.image}" alt="${p.title}"><div class="meta"><h4>${p.title}</h4><p class="muted">${p.excerpt}</p></div>`;
    blogList.appendChild(card);
  });
}).catch(()=>{});

const productImageMap = {
  'Polyethylene Water Trough': 'pictures/Polyethylene Water Trough.jpg',
  'Dairy Cow (Heifer)': 'pictures/dairy cow.jpg',
  'Chicken Feed (25kg)': 'pictures/chicken feed.jpg',
  'Seeds — Maize (10kg)': 'pictures/maiz seed.jpg'
};

function resolveProductImage(product){
  if(product && typeof product.image === 'string' && product.image.trim()) return product.image.trim();
  if(!product || !product.name) return '';
  return productImageMap[product.name] || '';
}

function renderProducts(list){
  productsEl.innerHTML='';
  list.forEach(p=>{
    const el = document.createElement('article');
    el.className='product';
    // media
    const media = document.createElement('div');
    media.className = 'product-media';
    const imageSrc = resolveProductImage(p);
    if(imageSrc){
      const img = document.createElement('img'); img.src = imageSrc; img.alt = p.name; media.appendChild(img);
    } else {
      const ph = document.createElement('div'); ph.className='product-placeholder'; ph.textContent='No image'; media.appendChild(ph);
    }
    // body
    const body = document.createElement('div'); body.className='product-body';
    const title = document.createElement('h4'); title.textContent = p.name;
    const cat = document.createElement('p'); cat.className='muted'; cat.textContent = p.category;
    const price = document.createElement('p'); price.className='price'; price.textContent = formatPrice(p.price);
    const actions = document.createElement('div'); actions.className='product-actions';
    const btn = document.createElement('button'); btn.setAttribute('data-id', p.id); btn.textContent = 'Add to cart'; btn.setAttribute('aria-label','Add '+p.name+' to cart');
    actions.appendChild(btn);
    body.appendChild(title); body.appendChild(cat); body.appendChild(price); body.appendChild(actions);
    el.appendChild(media); el.appendChild(body);
    productsEl.appendChild(el);
  });
}

document.addEventListener('click',e=>{
  if(e.target.tagName==='BUTTON' && e.target.dataset.id){
    const id = e.target.dataset.id;
    const p = products.find(x=>x.id==id);
    if(p){ addToCart(p); }
  }
  if(e.target.matches('.categories button')){
    document.querySelectorAll('.categories button').forEach(b=>b.classList.remove('active'));
    e.target.classList.add('active');
    const cat = e.target.dataset.cat;
    if(cat==='all') renderProducts(products); else renderProducts(products.filter(x=>x.categoryKey===cat));
  }
});

function addToCart(p){
  const existing = cart.find(x=>x.id===p.id);
  if(existing) existing.qty++; else cart.push({...p,qty:1});
  renderCart();
}

function renderCart(){
  if(cartList) cartList.innerHTML='';
  let total=0;
  cart.forEach(item=>{
    const li = document.createElement('li');
    li.textContent = `${item.name} x${item.qty} — ${formatPrice(item.price*item.qty)}`;
    if(cartList) cartList.appendChild(li);
    total += item.price*item.qty;
  });
  if(cartTotal) cartTotal.textContent = formatPrice(total);
  try{ localStorage.setItem('limarco_cart', JSON.stringify(cart)); }catch(e){}
  // update header cart count
  const count = cart.reduce((s,i)=>s+i.qty,0);
  const headerCount = document.getElementById('header-cart-count');
  if(headerCount) headerCount.textContent = count;

  // update floating cart badge, list and total if present
  const fBadge = document.getElementById('floating-cart-badge');
  const fList = document.getElementById('floating-cart-list');
  const fTotal = document.getElementById('floating-cart-total');
  const fEmpty = document.querySelector('.floating-cart-empty');
  if(fBadge) fBadge.textContent = count;
  if(fBadge) fBadge.style.display = count>0 ? 'inline-block' : 'none';
  if(fList){
    fList.innerHTML = '';
    if(cart.length===0){ if(fEmpty) fEmpty.style.display='block'; } else { if(fEmpty) fEmpty.style.display='none'; }
    cart.forEach(item=>{
      const li = document.createElement('li');
      li.textContent = `${item.name} x${item.qty}`;
      const price = document.createElement('span');
      price.textContent = formatPrice(item.price*item.qty);
      li.appendChild(price);
      fList.appendChild(li);
    });
  }
  if(fTotal) fTotal.textContent = formatPrice(total);
}

function formatPrice(n){ return '$'+Number(n).toFixed(2); }

// product modal interactions
document.addEventListener('click', e=>{
  if(e.target.closest('.product')){
    const btn = e.target.closest('.product').querySelector('button[data-id]');
    if(btn && !e.target.matches('button')){
      openModal(btn.dataset.id);
    }
  }
});

function openModal(id){
  const p = products.find(x=>x.id==id);
  if(!p) return;
  document.getElementById('modal-title').textContent = p.name;
  document.getElementById('modal-cat').textContent = p.category;
  document.getElementById('modal-price').textContent = formatPrice(p.price);
  document.getElementById('modal-desc').textContent = p.description||'Product details not available.';
  const modal = document.getElementById('product-modal');
  modal.setAttribute('aria-hidden','false');
  document.getElementById('modal-add').onclick = ()=>{ addToCart(p); modal.setAttribute('aria-hidden','true'); };
  modal.querySelector('.modal-close').onclick = ()=> modal.setAttribute('aria-hidden','true');
}

// header cart button toggles floating panel if present, otherwise scrolls to aside.cart
document.getElementById('header-cart')?.addEventListener('click', ()=>{
  const panel = document.getElementById('floating-cart-panel');
  const btn = document.getElementById('floating-cart-btn');
  if(panel && btn){ btn.click(); return; }
  const cartEl = document.querySelector('.cart');
  if(!cartEl) return;
  cartEl.scrollIntoView({behavior:'smooth',block:'center'});
});

// Premium featured carousel for hero
const featuredSlides = [
  {
    image: 'pictures/16ac754ea967e0112a97a2e1c76c5f0e.jpg',
    label: 'FARM OPERATIONS',
    title: 'Growing a Better Future',
    description: 'Quality agricultural solutions designed to support farmers, livestock and sustainable communities.',
    cta: 'Explore More',
    href: '#store'
  },
  {
    image: 'pictures/2026_04_22_23_34_IMG_1388.JPG',
    label: 'LIVESTOCK CARE',
    title: 'Healthy Animals, Stronger Farms',
    description: 'Reliable breeding, feeding and wellbeing support built around healthy agricultural outcomes.',
    cta: 'View Livestock',
    href: '#store'
  },
  {
    image: 'pictures/2026_04_22_23_34_IMG_1389.JPG',
    label: 'CROP SUCCESS',
    title: 'Soil, Seeds and Smart Growth',
    description: 'Practical crop guidance and dependable inputs for productive and resilient farms.',
    cta: 'Browse Shop',
    href: '#store'
  },
  {
    image: 'pictures/2026_04_22_23_34_IMG_1390.JPG',
    label: 'AGRIC SHOP',
    title: 'Tools for Everyday Farm Work',
    description: 'Farm hardware, supplies and essentials that help every task run more efficiently.',
    cta: 'Shop Essentials',
    href: '#store'
  },
  {
    image: 'pictures/2026_04_22_23_35_IMG_1391.JPG',
    label: 'COMMUNITY',
    title: 'Connecting Farmers Locally',
    description: 'A shared knowledge base for ideas, trade and practical advice across farming communities.',
    cta: 'Join the Forum',
    href: '#forum'
  },
  {
    image: 'pictures/2026_06_05_13_06_IMG_3793.JPG',
    label: 'FIELD CARE',
    title: 'Healthy Crops, Stronger Yields',
    description: 'Careful field management and practical growing support for productive seasonal farming.',
    cta: 'See More',
    href: '#store'
  },
  {
    image: 'pictures/2026_06_05_13_06_IMG_3794.JPG',
    label: 'FARM LIFE',
    title: 'Daily Work, Better Results',
    description: 'Hands-on farm routines and dependable systems that keep operations moving forward.',
    cta: 'View Farm Life',
    href: '#about'
  },
  {
    image: 'pictures/2026_06_05_13_06_IMG_3795.JPG',
    label: 'SUSTAINABLE GROWTH',
    title: 'Smart Farming for Tomorrow',
    description: 'Balanced agricultural practices built around resilience, productivity and long-term value.',
    cta: 'Learn More',
    href: '#offers'
  },
  {
    image: 'pictures/2026_06_05_13_07_IMG_3796.JPG',
    label: 'LOCAL SUPPORT',
    title: 'Working With Farmers Everyday',
    description: 'Trusted products and practical guidance for farms across the local community.',
    cta: 'Explore Support',
    href: '#contact'
  },
  {
    image: 'pictures/05b3d9cd5470116bace35bb4ac1df75b.jpg',
    label: 'QUALITY INPUTS',
    title: 'Reliable Supplies for Every Season',
    description: 'Agricultural essentials chosen to support day-to-day performance and dependable growth.',
    cta: 'Browse Products',
    href: '#store'
  },
  {
    image: 'pictures/5add52c003e75c00775a8a47d107abcf.jpg',
    label: 'RURAL HERITAGE',
    title: 'Farming Rooted in Community',
    description: 'Supportive agriculture for families, farmers and the wider rural economy.',
    cta: 'See Community',
    href: '#forum'
  },
  {
    image: 'pictures/7a780a124fb51d8d8ffac7fb5876c252.jpg',
    label: 'FUTURE FOCUS',
    title: 'Growing Progress Across the Farm',
    description: 'Modern agricultural thinking, local support and practical solutions for every stage of production.',
    cta: 'Discover More',
    href: '#store'
  }
];

function initCarousel(){
  const carousel = document.getElementById('main-carousel');
  if(!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const prev = carousel.querySelector('.carousel-prev');
  const next = carousel.querySelector('.carousel-next');
  const dotsWrap = carousel.querySelector('.carousel-dots');
  if(!track) return;

  let activeIndex = 0;
  let autoplayId = null;

  function getRelativePosition(index){
    const diff = (index - activeIndex + featuredSlides.length) % featuredSlides.length;
    return diff > featuredSlides.length / 2 ? diff - featuredSlides.length : diff;
  }

  function buildSlides(){
    track.innerHTML = '';

    featuredSlides.forEach((slide, index) => {
      const article = document.createElement('article');
      article.className = 'slide';
      article.dataset.index = String(index);
      article.tabIndex = 0;
      article.setAttribute('role', 'button');
      article.setAttribute('aria-label', slide.title);
      article.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');

      article.innerHTML = `
        <img src="${slide.image}" alt="${slide.title}">
        <div class="slide-content">
          <span class="slide-label">${slide.label}</span>
          <h2>${slide.title}</h2>
          <p>${slide.description}</p>
          <a href="${slide.href}" class="slide-cta">${slide.cta}</a>
        </div>
      `;

      article.addEventListener('click', () => setActive(index));
      article.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setActive(index);
        }
      });

      track.appendChild(article);
    });
  }

  function renderDots(){
    if(!dotsWrap) return;
    dotsWrap.innerHTML = '';

    featuredSlides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = index === activeIndex ? 'active' : '';
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
      dot.addEventListener('click', () => setActive(index));
      dotsWrap.appendChild(dot);
    });
  }

  function updateSlides(){
    const slides = Array.from(track.querySelectorAll('.slide'));

    slides.forEach((slide, index) => {
      const relativePosition = getRelativePosition(index);
      const abs = Math.abs(relativePosition);
      const isActive = relativePosition === 0;
      const width = isActive ? 'clamp(360px, 42vw, 540px)' : abs === 1 ? 'clamp(210px, 24vw, 290px)' : 'clamp(140px, 16vw, 200px)';
      const scale = isActive ? 1 : abs === 1 ? 0.9 : 0.72;
      const opacity = isActive ? 1 : abs === 1 ? 0.88 : 0.62;
      const zIndex = isActive ? 10 : abs === 1 ? 9 : 7;
      const offset = relativePosition * (abs === 2 ? 250 : abs === 1 ? 290 : 0);

      slide.classList.toggle('active', isActive);
      slide.classList.toggle('side', abs === 1);
      slide.classList.toggle('outer', abs === 2);
      slide.style.width = width;
      slide.style.opacity = String(opacity);
      slide.style.zIndex = String(zIndex);
      slide.style.setProperty('--offset', `${offset}px`);
      slide.style.setProperty('--scale', String(scale));
      slide.style.setProperty('--content-opacity', isActive ? '1' : '0');
      slide.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function updateAutoplay(){
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (autoplayId) clearInterval(autoplayId);
    autoplayId = setInterval(() => setActive((activeIndex + 1) % featuredSlides.length), 5200);
  }

  function setActive(index){
    activeIndex = (index + featuredSlides.length) % featuredSlides.length;
    updateSlides();
    renderDots();
    updateAutoplay();
  }

  prev?.addEventListener('click', () => setActive(activeIndex - 1));
  next?.addEventListener('click', () => setActive(activeIndex + 1));

  carousel.addEventListener('mouseenter', () => {
    if (autoplayId) clearInterval(autoplayId);
  });
  carousel.addEventListener('mouseleave', updateAutoplay);
  carousel.addEventListener('focusin', () => {
    if (autoplayId) clearInterval(autoplayId);
  });
  carousel.addEventListener('focusout', updateAutoplay);

  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') setActive(activeIndex + 1);
    if (event.key === 'ArrowLeft') setActive(activeIndex - 1);
  });

  buildSlides();
  updateSlides();
  renderDots();
  updateAutoplay();
}

function initWelcomeCarousel(){
  const wrapper = document.querySelector('.welcome-popup');
  const slides = Array.from(document.querySelectorAll('.welcome-slide'));
  const dots = Array.from(document.querySelectorAll('.welcome-dots span'));
  if(!wrapper || !slides.length || !dots.length) return;

  let activeIndex = 0;
  let timer = null;

  function showSlide(index){
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === activeIndex));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
  }

  function startAuto(){
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    clearInterval(timer);
    timer = setInterval(() => showSlide(activeIndex + 1), 5000);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      startAuto();
    });
  });

  wrapper.addEventListener('mouseenter', () => clearInterval(timer));
  wrapper.addEventListener('mouseleave', startAuto);
  showSlide(0);
  startAuto();
}

document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  initWelcomeCarousel();
});