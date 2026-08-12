// CONFIGURAÇÃO
const CONFIG = {
    categorias: {
        'bom-dia': { emoji: '☀️', nome: 'Bom Dia', ativo: true },
        'boa-noite': { emoji: '🌙', nome: 'Boa Noite', ativo: true },
        'religiosas': { emoji: '🙏', nome: 'Religiosas', ativo: true },
        'carinho': { emoji: '❤️', nome: 'Carinho', ativo: true },
        'especiais': { emoji: '🌹', nome: 'Especiais', ativo: true },
        'aniversario': { emoji: '🎂', nome: 'Aniversários', ativo: true }
    },
    totalImagens: 30
};

// ESTADO
let estado = {
    categoriaAtual: 'bom-dia',
    imagemAtual: '',
    historico: {}
};

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', function() {
    carregarHistorico();
    const categoriaSugerida = sugerirCategoriaPorHorario();
    estado.categoriaAtual = categoriaSugerida;
    renderizarCategorias();
    carregarImagem(estado.categoriaAtual);
    atualizarInterface();
    configurarEventos();
});

function sugerirCategoriaPorHorario() {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return 'bom-dia';
    if (hora >= 18 || hora < 5) return 'boa-noite';
    return 'bom-dia';
}

function getTodasImagens(categoria) {
    const imagens = [];
    for (let i = 1; i <= CONFIG.totalImagens; i++) {
        imagens.push(`img-${String(i).padStart(3, '0')}.jpg`);
    }
    return imagens;
}

function getImagensDisponiveis(categoria) {
    const todas = getTodasImagens(categoria);
    const usadas = estado.historico[categoria] || [];
    return todas.filter(img => !usadas.includes(img));
}

function carregarImagem(categoria) {
    const imgElement = document.getElementById('imagem-atual');
    const loading = document.getElementById('loading');
    
    loading.classList.remove('hidden');
    imgElement.style.opacity = '0';
    
    const disponiveis = getImagensDisponiveis(categoria);
    
    if (disponiveis.length === 0) {
        estado.historico[categoria] = [];
        salvarHistorico();
        carregarImagem(categoria);
        return;
    }
    
    const imagem = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    estado.imagemAtual = imagem;
    
    if (!estado.historico[categoria]) estado.historico[categoria] = [];
    estado.historico[categoria].push(imagem);
    salvarHistorico();
    
    const caminho = `imagens/${categoria}/${imagem}`;
    const tempImg = new Image();
    tempImg.onload = function() {
        imgElement.src = caminho;
        imgElement.classList.remove('fade-in');
        void imgElement.offsetWidth;
        imgElement.classList.add('fade-in');
        imgElement.style.opacity = '1';
        loading.classList.add('hidden');
        atualizarStatus();
    };
    tempImg.onerror = function() {
        imgElement.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext x="200" y="200" text-anchor="middle" dy=".3em" font-family="Arial" font-size="40" fill="%23999"%3E🖼️%3C/text%3E%3Ctext x="200" y="250" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999"%3EAdicione imagens%3C/text%3E%3C/svg%3E';
        imgElement.style.opacity = '1';
        loading.classList.add('hidden');
    };
    tempImg.src = caminho;
}

function atualizarInterface() {
    const info = CONFIG.categorias[estado.categoriaAtual];
    document.getElementById('categoria-emoji').textContent = info.emoji;
    document.getElementById('categoria-nome').textContent = info.nome;
    document.querySelectorAll('.categoria-item').forEach(el => {
        el.classList.toggle('ativa', el.dataset.categoria === estado.categoriaAtual);
    });
}

function atualizarStatus() {
    const usadas = (estado.historico[estado.categoriaAtual] || []).length;
    const total = CONFIG.totalImagens;
    document.getElementById('contador').textContent = `📊 ${usadas} de ${total} usadas`;
}

function renderizarCategorias() {
    const container = document.getElementById('lista-categorias');
    container.innerHTML = '';
    for (const [key, value] of Object.entries(CONFIG.categorias)) {
        if (!value.ativo) continue;
        const div = document.createElement('div');
        div.className = 'categoria-item';
        div.dataset.categoria = key;
        div.innerHTML = `<span class="emoji">${value.emoji}</span><span class="nome">${value.nome}</span>`;
        div.addEventListener('click', function() {
            const categoria = this.dataset.categoria;
            if (categoria !== estado.categoriaAtual) {
                estado.categoriaAtual = categoria;
                carregarImagem(categoria);
                atualizarInterface();
            }
        });
        container.appendChild(div);
    }
}

async function compartilharImagem() {
    const img = document.getElementById('imagem-atual');
    try {
        const response = await fetch(img.src);
        const blob = await response.blob();
        const file = new File([blob], 'mensagem.jpg', { type: 'image/jpeg' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file] });
        } else {
            await navigator.share({ title: '💌 Mensagem especial', text: '✨ Uma mensagem para você!', url: img.src });
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            alert('📤 Toque em "Copiar" e cole no WhatsApp');
        }
    }
}

function carregarHistorico() {
    try {
        const salvo = localStorage.getItem('mensagens_historico');
        if (salvo) estado.historico = JSON.parse(salvo);
    } catch (error) {}
}

function salvarHistorico() {
    try {
        localStorage.setItem('mensagens_historico', JSON.stringify(estado.historico));
    } catch (error) {}
}

function configurarEventos() {
    document.getElementById('btn-compartilhar').addEventListener('click', compartilharImagem);
    document.getElementById('btn-proxima').addEventListener('click', function() {
        carregarImagem(estado.categoriaAtual);
        atualizarInterface();
        this.style.transform = 'scale(0.95)';
        setTimeout(() => this.style.transform = 'scale(1)', 150);
    });
}