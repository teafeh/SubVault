
        let subscriptions = JSON.parse(localStorage.getItem('subvault_v4_ng')) || [];
        const formatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 });

        const PRESETS = [
            { name: 'GLO', url: 'gloworld.com', price: 5000 },
            { name: 'Netflix', url: 'netflix.com', price: 5000 },
            { name: 'YouTube', url: 'youtube.com', price: 1500 },
            { name: 'Spotify', url: 'spotify.com', price: 2000 },
            { name: 'Apple Music', url: 'apple.com', price: 2000 },
            { name: 'DSTV', url: 'dstv.com', price: 24500 },
            { name: 'GOTV', url: 'gotvafrica.com', price: 24500 }
        ];

        window.onload = () => { renderPresets(); renderVault(); };

        function renderPresets() {
            document.getElementById('presets-mobile').innerHTML = PRESETS.map(p => `
                <button onclick="addSubscription('${p.name}', ${p.price}, '${p.url}')" class="icon-circle active-tap">
                    <img src="https://icon.horse/icon/${p.url}">
                </button>
            `).join('');
        }

        function openAddModal() {
            document.getElementById('modal-title').innerText = "Add Sub";
            document.getElementById('edit-id').value = "";
            document.getElementById('sub-form').reset();
            document.getElementById('modal').classList.remove('hidden');
        }

        function closeModal() { document.getElementById('modal').classList.add('hidden'); }

        function openEditModal(id) {
            const sub = subscriptions.find(s => s.id === id);
            if (!sub) return;
            document.getElementById('modal-title').innerText = "Edit Sub";
            document.getElementById('edit-id').value = sub.id;
            document.getElementById('name').value = sub.name;
            document.getElementById('price').value = sub.price;
            document.getElementById('modal').classList.remove('hidden');
        }

        function addSubscription(name, price, url = '') {
            const sub = { id: Date.now(), name, price: parseFloat(price), url: url || `${name.toLowerCase()}.com` };
            subscriptions.push(sub);
            saveAndRefresh();
        }

        function deleteSub(id) {
            subscriptions = subscriptions.filter(s => s.id !== id);
            saveAndRefresh();
        }

        function saveAndRefresh() {
            localStorage.setItem('subvault_v4_ng', JSON.stringify(subscriptions));
            renderVault();
        }

        function renderVault() {
            const grid = document.getElementById('vault-grid');
            const empty = document.getElementById('empty-state');
            
            if (subscriptions.length === 0) {
                empty.classList.remove('hidden');
                grid.innerHTML = '';
            } else {
                empty.classList.add('hidden');
                grid.innerHTML = subscriptions.map((s, idx) => `
                    <div class="sub-card ${idx % 3 === 0 ? 'wide' : ''}">
                        <div class="flex justify-between items-start">
                            <img src="https://icon.horse/icon/${s.url}" class="w-8 h-8 rounded-lg">
                            <div class="flex gap-4">
                                <button onclick="openEditModal(${s.id})" class="text-slate-600 active-tap"><span class="iconify w-5 h-5" data-icon="ph:pencil-simple-bold"></span></button>
                                <button onclick="deleteSub(${s.id})" class="text-slate-700 active-tap"><span class="iconify w-5 h-5" data-icon="ph:trash-bold"></span></button>
                            </div>
                        </div>
                        <div>
                            <h4 class="font-800 text-[13px] tracking-tight uppercase text-slate-200">${s.name}</h4>
                            <p class="text-emerald-500 font-bold text-[12px]">${formatter.format(s.price)}</p>
                        </div>
                    </div>
                `).join('');
            }
            const monthly = subscriptions.reduce((acc, curr) => acc + curr.price, 0);
            document.getElementById('total-monthly').innerText = formatter.format(monthly);
        }

        document.getElementById('sub-form').onsubmit = (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const name = document.getElementById('name').value;
            let price = parseFloat(document.getElementById('price').value);
            if(document.getElementById('cycle').value === "12") price /= 12;

            if (id) {
                const index = subscriptions.findIndex(s => s.id == id);
                subscriptions[index].name = name;
                subscriptions[index].price = price;
            } else {
                addSubscription(name, price);
            }
            saveAndRefresh();
            closeModal();
        };

        function toggleAIChat() { document.getElementById('ai-chat').classList.toggle('hidden'); }
        function handleAICommand(e) {
            if (e.key === 'Enter') {
                const input = e.target.value.toLowerCase();
                if (input.includes('add')) {
                    let p = input.match(/\d+/g);
                    let price = p ? parseFloat(p[0]) : 0;
                    if (input.includes('k')) price *= 1000;
                    const name = input.replace('add', '').replace(p, '').replace('k', '').trim();
                    if (name && price > 0) addSubscription(name.toUpperCase(), price);
                }
                toggleAIChat();
                e.target.value = '';
            }
        }

        async function exportGrid() {
            const node = document.getElementById('capture-area');
            const dataUrl = await modernScreenshot.domToPng(node);
            const link = document.createElement('a');
            link.download = `vault-ng.png`;
            link.href = dataUrl;
            link.click();
        }
