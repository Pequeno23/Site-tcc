import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
// Adicionado Auth para permitir gravação no banco
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"; 

const firebaseConfig = {
  apiKey: "AIzaSyDZMRJY1_LPpEN3McyeIlAcVDk5aeuJwD4",
  authDomain: "theendlessawakening-5516e.firebaseapp.com",
  databaseURL: "https://theendlessawakening-5516e-default-rtdb.firebaseio.com",
  projectId: "theendlessawakening-5516e",
  storageBucket: "theendlessawakening-5516e.firebasestorage.app",
  messagingSenderId: "740446004064",
  appId: "1:740446004064:web:5b519a7bd0190025887405",
  measurementId: "G-KLX3PV3577"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Inicializa Auth
const db = getFirestore(app);

// Recupera ID do App para o caminho correto do banco
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Autenticação Anônima Automática (Necessária para permissão de escrita)
signInAnonymously(auth).catch((error) => {
    console.error("Erro na autenticação anônima:", error);
});

// ==========================================
// 2. LÓGICA GERAL DO SITE (DOM READY)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Site T.E.A carregado com sucesso!');

    // --- Inicializa ícones Lucide ---
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- Identifica a página atual ---
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // --- Destaque do Link Ativo na Navegação ---
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href').split('/').pop();
        if (linkHref === currentPage && linkHref !== '#' && linkHref !== '') {
            link.classList.add('active');
        }
    });

    // --- Lógica para Animações de Scroll (Restaurada) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach(el => observer.observe(el));

    // ==========================================
    // 3. LÓGICA DO BOTÃO DE DOWNLOAD
    // ==========================================
    const downloadBtn = document.getElementById('download-btn');
    const statusMsg = document.getElementById('status-msg');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', async (e) => {
            // Verifica se o link está configurado
            const href = downloadBtn.getAttribute('href');
            if (href === '#' || !href) {
                e.preventDefault();
                console.warn("Link de download não configurado.");
                if (statusMsg) {
                    statusMsg.textContent = "Link indisponível no momento.";
                    statusMsg.classList.remove('hidden');
                }
                return;
            }

            // Feedback visual rápido
            if (statusMsg) {
                statusMsg.classList.remove('hidden');
                statusMsg.textContent = "Iniciando download...";
            }

            try {
                // CAMINHO CORRIGIDO: artifacts/{appId}/public/data/downloads
                // Gravar na raiz ("downloads") causará erro de permissão neste ambiente
                const downloadsCol = collection(db, 'artifacts', appId, 'public', 'data', 'downloads');

                // Envia dados para o Firestore
                // Nota: removemos o await do addDoc para não atrasar o download do usuário
                addDoc(downloadsCol, {
                    uid_usuario: auth.currentUser ? auth.currentUser.uid : 'anonimo',
                    data_hora: serverTimestamp(),
                    navegador: navigator.userAgent,
                    origem: window.location.pathname,
                    plataforma: navigator.platform || 'Desconhecida',
                    arquivo: href
                }).then((docRef) => {
                    console.log("Download registrado no Firebase com ID:", docRef.id);
                }).catch((err) => {
                    console.error("Erro silencioso ao salvar:", err);
                });
                
                // Atualiza mensagem de sucesso visualmente
                if (statusMsg) {
                    statusMsg.textContent = "Download iniciado com sucesso!";
                    setTimeout(() => statusMsg.classList.add('hidden'), 4000);
                }

            } catch (error) {
                console.error("Erro geral no processo de download:", error);
            }
        });
    }
});