
        // DATA STORAGE: No login needed, uses browser localStorage
        let subscriptions = JSON.parse(localStorage.getItem('9ja_subvault_v1')) || [];
        const formatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 });

        const PRESETS = [
            { name: 'DSTV', url: 'multichoice.com', price: 24500 },
            { name: 'MTN', url: 'mtn.ng', price: 5000 },
            { name: 'Showmax', url: 'showmax.com', price: 2500 },
            { name: 'Netflix', url: 'netflix.com', price: 5000 },
            { name: 'Airtel', url: 'airtel.com.ng', price: 3500 },
            { name: 'Starlink', url: 'starlink.com', price: 38000 }
        ];

        window.onload = () => {
            renderPresets();
            renderVault();
        };

        function renderPresets() {
            document.getElementById('presets-mobile').innerHTML = PRESETS.map(p => `
                <button onclick="addSubscription('${p.name}', ${p.price}, '${p.url}')" class="bg-[#111] p-4 rounded-2xl flex items-center gap-3 active-tap border border-white/5">
                    <img src="https://icon.horse/icon/${p.url}" class="w-6 h-6 rounded-md">
                    <span class="text-xs font-bold text-slate-300">${p.name}</span>
                </button>
            `).join('');
        }

        function toggleModal(show) { document.getElementById('modal').classList.toggle('hidden', !show); }
        function toggleAIChat() { 
            const chat = document.getElementById('ai-chat');
            chat.classList.toggle('hidden');
            if(!chat.classList.contains('hidden')) document.getElementById('ai-input').focus();
        }

        function addSubscription(name, price, url = '') {
            const sub = { id: Date.now(), name, price: parseFloat(price), url: url || `${name.toLowerCase()}.com` };
            subscriptions.push(sub);
            saveData();
        }

        function deleteSub(id) {
            subscriptions = subscriptions.filter(s => s.id !== id);
            saveData();
        }

        function saveData() {
            localStorage.setItem('9ja_subvault_v1', JSON.stringify(subscriptions));
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
                        <div class="flex justify-between">
                            <img src="https://icon.horse/icon/${s.url}" class="w-10 h-10 rounded-xl">
                            <button onclick="deleteSub(${s.id})" class="text-slate-600 hover:text-red-500 active-tap">
                                <span class="iconify w-6 h-6" data-icon="ph:trash-bold"></span>
                            </button>
                        </div>
                        <div>
                            <h4 class="font-800 text-sm tracking-tight text-slate-200">${s.name.toUpperCase()}</h4>
                            <p class="text-emerald-500 font-bold text-xs">${formatter.format(s.price)}</p>
                        </div>
                    </div>
                `).join('');
            }

            const monthly = subscriptions.reduce((acc, curr) => acc + curr.price, 0);
            document.getElementById('total-monthly').innerText = formatter.format(monthly);
        }

        function handleAICommand(e) {
            if (e.key === 'Enter') {
                const input = e.target.value.toLowerCase();
                if (input.includes('add')) {
                    let priceMatch = input.match(/\d+/g);
                    let price = priceMatch ? parseFloat(priceMatch[0]) : 0;
                    if (input.includes('k')) price *= 1000;
                    const name = input.replace('add', '').replace(priceMatch, '').replace('k', '').trim();
                    if (name && price > 0) {
                        addSubscription(name.toUpperCase(), price);
                        showAIFeedback("Sharp! Added.");
                    }
                }
                setTimeout(() => toggleAIChat(), 1000);
                e.target.value = '';
            }
        }

        function showAIFeedback(msg) {
            const fb = document.getElementById('ai-feedback');
            fb.innerText = msg;
            setTimeout(() => fb.innerText = '', 2000);
        }

        document.getElementById('sub-form').onsubmit = (e) => {
            e.preventDefault();
            addSubscription(document.getElementById('name').value, document.getElementById('price').value);
            toggleModal(false);
            e.target.reset();
        };

        async function exportGrid() {
            const node = document.getElementById('capture-area');
            const dataUrl = await modernScreenshot.domToPng(node);
            const link = document.createElement('a');
            link.download = `subvault-share.png`;
            link.href = dataUrl;
            link.click();
        }