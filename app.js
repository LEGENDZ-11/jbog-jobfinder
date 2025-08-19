// jborg job finder - simple front-end MVP using localStorage
(function(){
  const $ = (sel, ctx=document)=>ctx.querySelector(sel);
  const $$ = (sel, ctx=document)=>Array.from(ctx.querySelectorAll(sel));
  const LS_KEYS = { users:'jb_users', jobs:'jb_jobs', session:'jb_session', applications:'jb_apps' };

  const nowYear = new Date().getFullYear();
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = nowYear;

  // Session helpers
  const store = {
    get(k){ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null } },
    set(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
  };

  function seed() {
    if (!store.get(LS_KEYS.jobs)) {
      const sample = [
        {id: crypto.randomUUID(), title:'Frontend Engineer', company:'Jborg Intl', location:'Lagos, NG', type:'Full-time', category:'Engineering', salary:'₦500k–₦700k/mo', description:'Build UI with React/TypeScript. 3+ years exp. Familiar with REST & testing.', createdAt: Date.now()-86400000*2 },
        {id: crypto.randomUUID(), title:'Product Designer', company:'KoloPay', location:'Remote (Africa)', type:'Remote', category:'Design', salary:'$1,200–$2,000/mo', description:'End-to-end product design, Figma, UX research.', createdAt: Date.now()-86400000*7 },
        {id: crypto.randomUUID(), title:'Marketing Lead', company:'AgroLink', location:'Accra, GH', type:'Full-time', category:'Marketing', salary:'Negotiable', description:'Own growth strategy, social, paid, SEO.', createdAt: Date.now()-86400000*10 },
        {id: crypto.randomUUID(), title:'Sales Executive', company:'FinBridge', location:'Abuja, NG', type:'Contract', category:'Sales', salary:'Base + Commission', description:'B2B sales for fintech APIs.', createdAt: Date.now()-86400000*1 },
        {id: crypto.randomUUID(), title:'Ops Associate', company:'HealthPlus', location:'Nairobi, KE', type:'Full-time', category:'Operations', salary:'KES 120k–180k', description:'Clinic ops coordination, reporting.', createdAt: Date.now()-86400000*4 }
      ];
      store.set(LS_KEYS.jobs, sample);
    }
    if (!store.get(LS_KEYS.users)) store.set(LS_KEYS.users, []);
    if (!store.get(LS_KEYS.applications)) store.set(LS_KEYS.applications, []);
  }
  seed();

  function currentUser(){
    const sess = store.get(LS_KEYS.session);
    if (!sess) return null;
    const users = store.get(LS_KEYS.users)||[];
    return users.find(u=>u.id===sess.userId) || null;
  }

  function updateNav(){
    const u = currentUser();
    const login = $('#nav-login'), register = $('#nav-register'), logout = $('#nav-logout');
    if (!login || !register || !logout) return;
    if (u){
      login.style.display='none';
      register.style.display='none';
      logout.style.display='inline-block';
      logout.addEventListener('click', ()=>{ localStorage.removeItem(LS_KEYS.session); location.reload(); });
    } else {
      login.style.display='inline-block';
      register.style.display='inline-block';
      logout.style.display='none';
    }
  }
  updateNav();

  // INDEX: render featured jobs
  (function renderFeatured(){
    const wrap = document.getElementById('featured-jobs');
    if (!wrap) return;
    const jobs = (store.get(LS_KEYS.jobs)||[]).slice(0,4);
    jobs.forEach(j=>{
      const card = document.createElement('div');
      card.className = 'card job-card';
      card.innerHTML = `
        <h3>${j.title}</h3>
        <p class="muted">${j.company} • ${j.location}</p>
        <div class="meta"><span class="badge">${j.type}</span><span class="badge">${j.category}</span></div>
        <p>${j.salary || ''}</p>
        <a class="btn small" href="job-details.html?id=${encodeURIComponent(j.id)}">View</a>
      `;
      wrap.appendChild(card);
    });
  })();

  // JOBS: list, search, paginate
  (function jobsPage(){
    const list = document.getElementById('job-list');
    if (!list) return;

    const PAGE = 6;
    let state = {
      q: new URLSearchParams(location.search).get('q') || '',
      loc: new URLSearchParams(location.search).get('loc') || '',
      category: '',
      type: '',
      page: 1
    };

    const jobs = store.get(LS_KEYS.jobs)||[];

    function applyFilters(){
      let rows = jobs.slice().sort((a,b)=>b.createdAt-a.createdAt);
      if (state.q) rows = rows.filter(j => [j.title,j.company,j.description].join(' ').toLowerCase().includes(state.q.toLowerCase()));
      if (state.loc) rows = rows.filter(j => j.location.toLowerCase().includes(state.loc.toLowerCase()));
      if (state.category) rows = rows.filter(j => j.category === state.category);
      if (state.type) rows = rows.filter(j => j.type === state.type);
      return rows;
    }

    function render(){
      const rows = applyFilters();
      const start = (state.page-1)*PAGE;
      const pageRows = rows.slice(start, start+PAGE);
      list.innerHTML='';
      pageRows.forEach(j=>{
        const el = document.createElement('div');
        el.className='job-row';
        el.innerHTML = `
          <div style="flex:1">
            <h3 style="margin:0 0 6px"><a href="job-details.html?id=${encodeURIComponent(j.id)}">${j.title}</a></h3>
            <div class="meta">
              <span>${j.company}</span> •
              <span>${j.location}</span> •
              <span class="badge">${j.type}</span>
              <span class="badge">${j.category}</span>
              <span>${j.salary||''}</span>
            </div>
            <p class="muted">${(j.description||'').slice(0,140)}...</p>
          </div>
          <a class="btn small" href="job-details.html?id=${encodeURIComponent(j.id)}">Apply</a>
        `;
        list.appendChild(el);
      });
      renderPagination(rows.length);
    }

    function renderPagination(total){
      const pages = Math.max(1, Math.ceil(total/PAGE));
      const pag = document.getElementById('pagination');
      pag.innerHTML='';
      for (let i=1;i<=pages;i++){
        const b = document.createElement('button');
        b.textContent = i;
        if (i===state.page) b.disabled=true;
        b.addEventListener('click', ()=>{ state.page=i; render(); window.scrollTo({top:0,behavior:'smooth'}); });
        pag.appendChild(b);
      }
    }

    // Hook up controls
    $('#search-query').value = state.q;
    $('#search-btn').addEventListener('click', ()=>{
      state.q = $('#search-query').value.trim();
      state.page = 1; render();
    });
    $('#filter-category').addEventListener('change', e=>{ state.category = e.target.value; state.page=1; render(); });
    $('#filter-type').addEventListener('change', e=>{ state.type = e.target.value; state.page=1; render(); });
    $('#filter-location').addEventListener('input', e=>{ state.loc = e.target.value; state.page=1; });
    $('#apply-filters').addEventListener('click', ()=> render());

    render();
  })();

  // JOB DETAILS + APPLY
  (function jobDetails(){
    const container = document.getElementById('job-details');
    if (!container) return;
    const id = new URLSearchParams(location.search).get('id');
    const job = (store.get(LS_KEYS.jobs)||[]).find(j=>j.id===id);
    if (!job){ container.innerHTML = '<p>Job not found.</p>'; return; }

    container.innerHTML = `
      <h1>${job.title}</h1>
      <p class="muted">${job.company} • ${job.location}</p>
      <div class="meta"><span class="badge">${job.type}</span><span class="badge">${job.category}</span></div>
      <p><strong>Salary:</strong> ${job.salary||'Not specified'}</p>
      <hr>
      <p>${job.description.replace(/\n/g,'<br>')}</p>
    `;

    const form = document.getElementById('applyForm');
    const msg = document.getElementById('applyMessage');
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      let cvName = '';
      const file = document.getElementById('cvFile').files[0];
      if (file){
        // For a static site, we cannot truly upload. We "store" metadata only.
        cvName = file.name;
      }
      const app = {
        id: crypto.randomUUID(),
        jobId: job.id,
        name: fd.get('name'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        cover: fd.get('cover'),
        cv: cvName,
        createdAt: Date.now()
      };
      const apps = store.get(LS_KEYS.applications)||[];
      apps.push(app);
      store.set(LS_KEYS.applications, apps);
      form.reset();
      msg.textContent = 'Application submitted! (Demo mode – stored locally)';
    });
  })();

  // AUTH
  (function auth(){
    const reg = document.getElementById('registerForm');
    const login = document.getElementById('loginForm');

    if (reg){
      reg.addEventListener('submit', (e)=>{
        e.preventDefault();
        const fd = new FormData(reg);
        const users = store.get(LS_KEYS.users)||[];
        const email = fd.get('email').toLowerCase();
        if (users.some(u=>u.email===email)) { alert('Email already registered.'); return; }
        const user = {
          id: crypto.randomUUID(),
          name: fd.get('name'),
          email,
          password: fd.get('password'), // DO NOT store plaintext in production
          role: fd.get('role')
        };
        users.push(user);
        store.set(LS_KEYS.users, users);
        store.set(LS_KEYS.session, { userId:user.id });
        location.href = user.role==='employer' ? 'employer-dashboard.html' : 'index.html';
      });
    }

    if (login){
      login.addEventListener('submit', (e)=>{
        e.preventDefault();
        const fd = new FormData(login);
        const email = fd.get('email').toLowerCase();
        const pass = fd.get('password');
        const users = store.get(LS_KEYS.users)||[];
        const user = users.find(u=>u.email===email && u.password===pass);
        if (!user){ alert('Invalid credentials'); return; }
        store.set(LS_KEYS.session, { userId:user.id });
        location.href = user.role==='employer' ? 'employer-dashboard.html' : 'index.html';
      });
    }
  })();

  // EMPLOYER DASHBOARD
  (function employer(){
    const form = document.getElementById('postJobForm');
    if (!form) return;
    const me = currentUser();
    if (!me || me.role!=='employer'){ alert('Employer account required. Redirecting to login.'); location.href='login.html'; return; }

    function renderMyJobs(){
      const wrap = document.getElementById('employer-jobs');
      const jobs = (store.get(LS_KEYS.jobs)||[]).filter(j=>j.ownerId===me.id);
      wrap.innerHTML='';
      if (jobs.length===0){ wrap.innerHTML='<p class="muted">No jobs yet.</p>'; return; }
      jobs.forEach(j=>{
        const row = document.createElement('div');
        row.className='job-row';
        row.innerHTML = `
          <div style="flex:1">
            <h3><a href="job-details.html?id=${encodeURIComponent(j.id)}">${j.title}</a></h3>
            <div class="meta"><span>${j.company}</span> • <span>${j.location}</span> • <span class="badge">${j.type}</span></div>
          </div>
          <button class="btn small delete" data-id="${j.id}">Delete</button>
        `;
        wrap.appendChild(row);
      });
      $$('.delete', wrap).forEach(btn=>btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-id');
        const jobs = store.get(LS_KEYS.jobs)||[];
        store.set(LS_KEYS.jobs, jobs.filter(j=>j.id!==id));
        renderMyJobs();
      }));
    }

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      const job = {
        id: crypto.randomUUID(),
        ownerId: me.id,
        title: fd.get('title'),
        company: fd.get('company'),
        location: fd.get('location'),
        type: fd.get('type'),
        category: fd.get('category'),
        salary: fd.get('salary'),
        description: fd.get('description'),
        createdAt: Date.now()
      };
      const jobs = store.get(LS_KEYS.jobs)||[];
      jobs.unshift(job);
      store.set(LS_KEYS.jobs, jobs);
      form.reset();
      const msg = document.getElementById('postMsg'); if (msg) msg.textContent='Job posted!';
      renderMyJobs();
    });

    renderMyJobs();
  })();

})();