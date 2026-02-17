/* ========================================
   EMDA - Banco de Talentos
   Application JavaScript v2.0
   + Verificação "já enviado"
   + Notificação WhatsApp
   + Tela de sucesso melhorada
   + Botão voltar na Etapa 1
======================================== */

// ========================================
// Configuration
// ========================================

const CONFIG = {
    // URL do Google Apps Script Web App
    GOOGLE_SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL',
    
    // WhatsApp da escola para notificações
    WHATSAPP_NOTIFY: '5531988148522',
    
    // Tempo de splash screen (ms)
    SPLASH_DURATION: 4000,
    
    // Validação de telefone
    PHONE_REGEX: /^\(?[1-9]{2}\)?\s?(?:9\d{4}|\d{4})-?\d{4}$/
};

// ========================================
// DOM Elements
// ========================================

const elements = {
    splashScreen: document.getElementById('splash-screen'),
    app: document.getElementById('app'),
    welcomeScreen: document.getElementById('welcome-screen'),
    formContainer: document.getElementById('form-container'),
    startBtn: document.getElementById('start-btn'),
    form: document.getElementById('curriculum-form'),
    installPrompt: document.getElementById('install-prompt'),
    installAccept: document.getElementById('install-accept'),
    installDismiss: document.getElementById('install-dismiss'),
    photoUpload: document.getElementById('photo-upload'),
    photoInput: document.getElementById('photo-input'),
    cameraInput: document.getElementById('camera-input'),
    photoPreview: document.getElementById('photo-preview'),
    photoPlaceholder: document.getElementById('photo-placeholder'),
    btnGallery: document.getElementById('btn-gallery'),
    btnSelfie: document.getElementById('btn-selfie'),
    progressFill: document.querySelectorAll('.progress-fill'),
    progressSteps: document.querySelectorAll('.progress-step'),
    formSteps: document.querySelectorAll('.form-step'),
    successModal: document.getElementById('success-modal'),
    submitBtn: document.querySelector('.btn-submit')
};

// ========================================
// State
// ========================================

let currentStep = 1;
let photoBase64 = null;

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initSplashScreen();
    initWelcomeScreen();
    initPhotoUpload();
    initFormNavigation();
    initFormValidation();
    initPhoneMask();
    initCityAutocomplete();
    initServiceWorker();
    initInstallPrompt();
});

// ========================================
// Splash Screen
// ========================================

function initSplashScreen() {
    setTimeout(() => {
        elements.splashScreen.classList.add('fade-out');
        elements.app.classList.remove('hidden');
        
        setTimeout(() => {
            elements.splashScreen.style.display = 'none';
        }, 600);
    }, CONFIG.SPLASH_DURATION);
}

// ========================================
// Welcome Screen + Verificação "Já Enviado"
// ========================================

function initWelcomeScreen() {
    elements.startBtn.addEventListener('click', () => {
        // Verificar se já enviou o currículo
        const alreadySent = localStorage.getItem('emda_curriculo_enviado');
        
        if (alreadySent) {
            const savedData = JSON.parse(alreadySent);
            showAlreadySentModal(savedData);
            return;
        }
        
        showForm();
    });
}

function showForm() {
    elements.welcomeScreen.style.opacity = '0';
    elements.welcomeScreen.style.transform = 'translateY(-20px)';
    elements.welcomeScreen.style.transition = 'all 0.5s ease';
    
    setTimeout(() => {
        elements.welcomeScreen.classList.add('hidden');
        elements.formContainer.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, 500);
}

function showAlreadySentModal(savedData) {
    const existing = document.querySelector('.already-sent-modal');
    if (existing) existing.remove();
    
    const dataEnvio = savedData.dataEnvio ? new Date(savedData.dataEnvio).toLocaleDateString('pt-BR') : '';
    
    const modal = document.createElement('div');
    modal.className = 'already-sent-modal';
    modal.innerHTML = `
        <div class="already-sent-content">
            <div class="already-sent-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C9A962" stroke-width="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </div>
            <h3 class="already-sent-title">Currículo já cadastrado</h3>
            <p class="already-sent-name">${savedData.nome || ''}</p>
            ${dataEnvio ? `<p class="already-sent-date">Enviado em ${dataEnvio}</p>` : ''}
            <p class="already-sent-description">
                Você já cadastrou seu currículo no Banco de Talentos. Deseja atualizar seus dados?
            </p>
            <div class="already-sent-buttons">
                <button class="btn btn-secondary already-sent-btn-close">
                    Não, obrigado
                </button>
                <button class="btn btn-primary already-sent-btn-update">
                    Atualizar dados
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
    
    modal.querySelector('.already-sent-btn-close').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });
    
    modal.querySelector('.already-sent-btn-update').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            localStorage.removeItem('emda_curriculo_enviado');
            showForm();
        }, 300);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    });
}

// ========================================
// Photo Upload
// ========================================

function initPhotoUpload() {
    elements.photoUpload.addEventListener('click', () => {
        elements.photoInput.click();
    });
    
    elements.btnGallery.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.photoInput.click();
    });
    
    elements.btnSelfie.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.cameraInput.click();
    });
    
    elements.photoInput.addEventListener('change', handlePhotoSelect);
    elements.cameraInput.addEventListener('change', handlePhotoSelect);
}

function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida.');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        photoBase64 = event.target.result;
        elements.photoPreview.src = photoBase64;
        elements.photoPreview.classList.remove('hidden');
        elements.photoPlaceholder.classList.add('hidden');
        elements.photoUpload.style.borderStyle = 'solid';
        elements.photoUpload.style.borderColor = 'var(--color-gold)';
    };
    reader.readAsDataURL(file);
}

// ========================================
// Form Navigation
// ========================================

function initFormNavigation() {
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
            const nextStep = parseInt(btn.dataset.next);
            if (validateStep(currentStep)) {
                goToStep(nextStep);
            }
        });
    });
    
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = parseInt(btn.dataset.prev);
            if (prevStep === 0) {
                // Voltar para Welcome Screen
                backToWelcome();
            } else {
                goToStep(prevStep);
            }
        });
    });
}

function backToWelcome() {
    elements.formContainer.style.opacity = '0';
    elements.formContainer.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        elements.formContainer.classList.add('hidden');
        elements.formContainer.style.opacity = '';
        elements.formContainer.style.transition = '';
        elements.welcomeScreen.classList.remove('hidden');
        elements.welcomeScreen.style.opacity = '1';
        elements.welcomeScreen.style.transform = 'translateY(0)';
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, 300);
}

function goToStep(step) {
    elements.formSteps.forEach(formStep => {
        formStep.classList.remove('active');
        if (parseInt(formStep.dataset.step) === step) {
            formStep.classList.add('active');
        }
    });
    
    elements.progressSteps.forEach((progressStep, index) => {
        progressStep.classList.remove('active', 'completed');
        if (index + 1 < step) {
            progressStep.classList.add('completed');
        } else if (index + 1 === step) {
            progressStep.classList.add('active');
        }
    });
    
    elements.progressFill.forEach((fill, index) => {
        if (index < step - 1) {
            fill.style.width = '100%';
        } else {
            fill.style.width = '0';
        }
    });
    
    currentStep = step;
    elements.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ========================================
// Form Validation
// ========================================

function initFormValidation() {
    elements.form.addEventListener('submit', handleSubmit);
}

function validateStep(step) {
    const currentFormStep = document.querySelector(`.form-step[data-step="${step}"]`);
    const requiredInputs = currentFormStep.querySelectorAll('[required]');
    let isValid = true;
    
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            highlightError(input);
        } else {
            clearError(input);
        }
    });
    
    if (step === 1) {
        const emailInput = document.getElementById('email');
        if (emailInput.value && !isValidEmail(emailInput.value)) {
            isValid = false;
            highlightError(emailInput);
        }
        
        const phoneInput = document.getElementById('whatsapp');
        if (phoneInput.value && !isValidPhone(phoneInput.value)) {
            isValid = false;
            highlightError(phoneInput);
        }
    }
    
    if (step === 2) {
        const cursos = document.querySelectorAll('input[name="cursos"]:checked');
        if (cursos.length === 0) {
            isValid = false;
            alert('Por favor, selecione pelo menos um curso.');
        }
    }
    
    if (!isValid) {
        currentFormStep.style.animation = 'none';
        currentFormStep.offsetHeight;
        currentFormStep.style.animation = 'shake 0.5s ease';
    }
    
    return isValid;
}

function highlightError(input) {
    input.style.borderColor = '#D4A5A5';
    input.addEventListener('input', () => clearError(input), { once: true });
}

function clearError(input) {
    input.style.borderColor = '';
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
}

// ========================================
// Phone Mask
// ========================================

function initPhoneMask() {
    const phoneInput = document.getElementById('whatsapp');
    
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        
        if (value.length > 0) {
            if (value.length <= 2) {
                value = `(${value}`;
            } else if (value.length <= 7) {
                value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            } else {
                value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
            }
        }
        
        e.target.value = value;
    });
}

// ========================================
// City Autocomplete
// ========================================

const BRAZILIAN_CITIES = [
    "Belo Horizonte, MG", "São Paulo, SP", "Rio de Janeiro, RJ", "Brasília, DF",
    "Salvador, BA", "Fortaleza, CE", "Curitiba, PR", "Recife, PE", "Porto Alegre, RS",
    "Manaus, AM", "Belém, PA", "Goiânia, GO", "Guarulhos, SP", "Campinas, SP",
    "São Luís, MA", "São Gonçalo, RJ", "Maceió, AL", "Duque de Caxias, RJ",
    "Natal, RN", "Teresina, PI", "São Bernardo do Campo, SP", "Campo Grande, MS",
    "Nova Iguaçu, RJ", "João Pessoa, PB", "Santo André, SP", "São José dos Campos, SP",
    "Osasco, SP", "Ribeirão Preto, SP", "Jaboatão dos Guararapes, PE", "Uberlândia, MG",
    "Contagem, MG", "Sorocaba, SP", "Aracaju, SE", "Feira de Santana, BA",
    "Cuiabá, MT", "Joinville, SC", "Aparecida de Goiânia, GO", "Londrina, PR",
    "Juiz de Fora, MG", "Ananindeua, PA", "Niterói, RJ", "Porto Velho, RO",
    "Serra, ES", "Belford Roxo, RJ", "Caxias do Sul, RS", "Campos dos Goytacazes, RJ",
    "Florianópolis, SC", "Macapá, AP", "Vila Velha, ES", "Mauá, SP",
    "São João de Meriti, RJ", "São José do Rio Preto, SP", "Santos, SP", "Mogi das Cruzes, SP",
    "Betim, MG", "Diadema, SP", "Campina Grande, PB", "Jundiaí, SP", "Maringá, PR",
    "Montes Claros, MG", "Piracicaba, SP", "Carapicuíba, SP", "Olinda, PE",
    "Cariacica, ES", "Bauru, SP", "Rio Branco, AC", "Anápolis, GO", "Vitória, ES",
    "Caucaia, CE", "Ponta Grossa, PR", "Itaquaquecetuba, SP", "Blumenau, SC",
    "Vitória da Conquista, BA", "Pelotas, RS", "Franca, SP", "Guarujá, SP",
    "Petrolina, PE", "Canoas, RS", "Paulista, PE", "Ribeirão das Neves, MG",
    "Uberaba, MG", "Cascavel, PR", "Praia Grande, SP", "Santa Maria, RS",
    "Governador Valadares, MG", "Gravataí, RS", "Caruaru, PE", "Ipatinga, MG",
    "Novo Hamburgo, RS", "São Vicente, SP", "Serra Talhada, PE", "Sete Lagoas, MG",
    "Divinópolis, MG", "Poços de Caldas, MG", "Barbacena, MG", "Patos de Minas, MG",
    "Conselheiro Lafaiete, MG", "Varginha, MG", "Sabará, MG", "Santa Luzia, MG",
    "Itabira, MG", "Passos, MG", "Teófilo Otoni, MG", "Lavras, MG",
    "Nova Lima, MG", "Araguari, MG", "Itaúna, MG", "Ituiutaba, MG",
    "Patrocínio, MG", "Manhuaçu, MG", "São João del-Rei, MG", "Muriaé, MG",
    "Araxá, MG", "Alfenas, MG", "Ponte Nova, MG", "Viçosa, MG",
    "Ouro Preto, MG", "Caratinga, MG", "Ubá, MG", "Curvelo, MG"
];

function initCityAutocomplete() {
    const cidadeInput = document.getElementById('cidade');
    const suggestionsContainer = document.getElementById('cidade-suggestions');
    
    if (!cidadeInput || !suggestionsContainer) return;
    
    let activeIndex = -1;
    
    cidadeInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase().trim();
        
        if (value.length < 2) {
            suggestionsContainer.classList.remove('show');
            suggestionsContainer.innerHTML = '';
            return;
        }
        
        const filtered = BRAZILIAN_CITIES.filter(city => 
            city.toLowerCase().includes(value)
        ).slice(0, 8);
        
        if (filtered.length === 0) {
            suggestionsContainer.classList.remove('show');
            suggestionsContainer.innerHTML = '';
            return;
        }
        
        activeIndex = -1;
        suggestionsContainer.innerHTML = filtered.map((city, index) => {
            const regex = new RegExp(`(${value})`, 'gi');
            const highlighted = city.replace(regex, '<strong>$1</strong>');
            return `<div class="autocomplete-item" data-index="${index}" data-value="${city}">${highlighted}</div>`;
        }).join('');
        
        suggestionsContainer.classList.add('show');
        
        suggestionsContainer.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', () => {
                cidadeInput.value = item.dataset.value.split(',')[0];
                suggestionsContainer.classList.remove('show');
                
                const state = item.dataset.value.split(',')[1]?.trim();
                if (state) {
                    const estadoSelect = document.getElementById('estado');
                    if (estadoSelect) {
                        estadoSelect.value = state;
                    }
                }
            });
        });
    });
    
    cidadeInput.addEventListener('keydown', (e) => {
        const items = suggestionsContainer.querySelectorAll('.autocomplete-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, items.length - 1);
            updateActiveItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            updateActiveItem(items);
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            items[activeIndex]?.click();
        } else if (e.key === 'Escape') {
            suggestionsContainer.classList.remove('show');
        }
    });
    
    function updateActiveItem(items) {
        items.forEach((item, index) => {
            item.classList.toggle('active', index === activeIndex);
        });
    }
    
    document.addEventListener('click', (e) => {
        if (!cidadeInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.classList.remove('show');
        }
    });
}

// ========================================
// Form Submission
// ========================================

async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    
    const termos = document.getElementById('termos');
    if (!termos.checked) {
        alert('Por favor, aceite os termos para continuar.');
        return;
    }
    
    setLoadingState(true);
    
    const formData = collectFormData();
    
    try {
        await sendToGoogleSheets(formData);
        
        // Salvar flag de "já enviou"
        localStorage.setItem('emda_curriculo_enviado', JSON.stringify({
            nome: formData.nome,
            email: formData.email,
            dataEnvio: new Date().toISOString()
        }));
        
        // Mostrar tela de sucesso
        showSuccessScreen(formData);
        
        // Enviar notificação via WhatsApp (abre em nova aba)
        setTimeout(() => {
            sendWhatsAppNotification(formData);
        }, 1500);
        
    } catch (error) {
        console.error('Erro ao enviar:', error);
        alert('Ocorreu um erro ao enviar seu currículo. Por favor, tente novamente.');
    } finally {
        setLoadingState(false);
    }
}

function collectFormData() {
    const cursos = Array.from(document.querySelectorAll('input[name="cursos"]:checked'))
        .map(cb => cb.value)
        .join(', ');
    
    return {
        timestamp: new Date().toISOString(),
        nome: document.getElementById('nome').value.trim(),
        email: document.getElementById('email').value.trim(),
        whatsapp: document.getElementById('whatsapp').value.trim(),
        cidade: document.getElementById('cidade').value.trim(),
        estado: document.getElementById('estado').value,
        cursos: cursos,
        ano_conclusao: document.getElementById('ano_conclusao').value,
        experiencia: document.getElementById('experiencia').value.trim(),
        instagram: document.getElementById('instagram').value.trim(),
        portfolio: document.getElementById('portfolio').value.trim(),
        linkedin: document.getElementById('linkedin').value.trim(),
        sobre: document.getElementById('sobre').value.trim(),
        foto: photoBase64 ? 'Sim' : 'Não',
        foto_base64: photoBase64 || ''
    };
}

async function sendToGoogleSheets(data) {
    if (CONFIG.GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        console.log('Dados coletados (modo simulação):', data);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true };
    }
    
    const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    return { success: true };
}

// ========================================
// WhatsApp Notification
// ========================================

function sendWhatsAppNotification(formData) {
    const cursos = formData.cursos || 'Não informado';
    const cidade = formData.cidade ? `${formData.cidade}/${formData.estado}` : 'Não informada';
    
    const message = 
        `📋 *NOVO CURRÍCULO - Banco de Talentos EMDA*\n\n` +
        `👤 *Nome:* ${formData.nome}\n` +
        `📧 *Email:* ${formData.email}\n` +
        `📱 *WhatsApp:* ${formData.whatsapp}\n` +
        `📍 *Cidade:* ${cidade}\n` +
        `🎓 *Cursos:* ${cursos}\n` +
        `📅 *Conclusão:* ${formData.ano_conclusao || 'Não informado'}\n` +
        (formData.instagram ? `📸 *Instagram:* @${formData.instagram}\n` : '') +
        (formData.portfolio ? `🔗 *Portfólio:* ${formData.portfolio}\n` : '') +
        (formData.linkedin ? `💼 *LinkedIn:* ${formData.linkedin}\n` : '') +
        `\n📅 *Enviado em:* ${new Date().toLocaleString('pt-BR')}`;
    
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${CONFIG.WHATSAPP_NOTIFY}&text=${encoded}`;
    
    window.open(whatsappUrl, '_blank');
}

// ========================================
// Success Screen
// ========================================

function showSuccessScreen(formData) {
    elements.formContainer.classList.add('hidden');
    elements.successModal.classList.add('hidden');
    
    const successScreen = document.createElement('div');
    successScreen.className = 'success-screen';
    successScreen.innerHTML = `
        <div class="success-screen-bg">
            <div class="success-particles">
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
            </div>
        </div>
        <div class="success-screen-content">
            <div class="success-check-container">
                <svg class="success-check" width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#C9A962" stroke-width="1.5" opacity="0.3"/>
                    <circle class="success-circle-anim" cx="12" cy="12" r="10" stroke="#C9A962" stroke-width="1.5" 
                        stroke-dasharray="63" stroke-dashoffset="63"/>
                    <polyline class="success-tick-anim" points="8 12.5 11 15.5 16 9" stroke="#C9A962" stroke-width="2" 
                        stroke-linecap="round" stroke-linejoin="round"
                        stroke-dasharray="20" stroke-dashoffset="20"/>
                </svg>
            </div>
            
            <h2 class="success-title">Currículo Enviado!</h2>
            
            <div class="success-divider">
                <span class="divider-line"></span>
                <span class="divider-star">✦</span>
                <span class="divider-line"></span>
            </div>
            
            <p class="success-name">${formData.nome}</p>
            
            <p class="success-message">
                Obrigado por se cadastrar no nosso Banco de Talentos. 
                Entraremos em contato caso surja uma oportunidade compatível com seu perfil.
            </p>
            
            <div class="success-info">
                <div class="success-info-item">
                    <span class="success-info-icon">🎓</span>
                    <span>${formData.cursos}</span>
                </div>
                <div class="success-info-item">
                    <span class="success-info-icon">📍</span>
                    <span>${formData.cidade}/${formData.estado}</span>
                </div>
            </div>
            
            <div class="success-actions">
                <a href="https://escolademodadeniseaguiar.com.br" class="btn btn-primary success-btn" target="_blank">
                    Visitar nosso site
                </a>
                <button class="btn btn-secondary success-btn success-btn-close">
                    Fechar
                </button>
            </div>
            
            <div class="success-footer-area">
                <img src="img/logo-white.png" alt="EMDA" class="success-footer-logo">
                <p>Escola de Moda Denise Aguiar</p>
                <p class="success-footer-small">+37 anos formando profissionais de moda</p>
            </div>
        </div>
    `;
    
    elements.app.appendChild(successScreen);
    
    // Botão fechar
    successScreen.querySelector('.success-btn-close').addEventListener('click', () => {
        window.close();
        // Fallback se window.close() não funcionar
        location.reload();
    });
    
    requestAnimationFrame(() => {
        successScreen.classList.add('show');
    });
}

function setLoadingState(isLoading) {
    if (isLoading) {
        elements.submitBtn.classList.add('loading');
        elements.submitBtn.disabled = true;
    } else {
        elements.submitBtn.classList.remove('loading');
        elements.submitBtn.disabled = false;
    }
}

function showSuccessModal() {
    elements.successModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// ========================================
// Service Worker
// ========================================

function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registrado:', registration.scope);
            })
            .catch(error => {
                console.log('Erro ao registrar Service Worker:', error);
            });
    }
}

// ========================================
// PWA Install Prompt
// ========================================

let deferredPrompt = null;

function initInstallPrompt() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return;
    }
    
    const dismissedAt = localStorage.getItem('installDismissed');
    if (dismissedAt && (Date.now() - parseInt(dismissedAt)) < 24 * 60 * 60 * 1000) {
        return;
    }
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        setTimeout(() => showInstallPrompt(), 3000);
    });
    
    elements.installAccept.addEventListener('click', handleInstallClick);
    elements.installDismiss.addEventListener('click', hideInstallPrompt);
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isInStandaloneMode = window.navigator.standalone === true;
    
    if (isIOS && !isInStandaloneMode) {
        setTimeout(() => showIOSInstallPrompt(), 5000);
    }
}

function showInstallPrompt() {
    elements.installPrompt.classList.add('show');
}

function hideInstallPrompt() {
    elements.installPrompt.classList.remove('show');
    localStorage.setItem('installDismissed', Date.now().toString());
}

async function handleInstallClick() {
    if (!deferredPrompt) {
        showIOSInstallPrompt();
        return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Resultado da instalação:', outcome);
    deferredPrompt = null;
    hideInstallPrompt();
}

function showIOSInstallPrompt() {
    const modal = document.createElement('div');
    modal.className = 'ios-install-modal';
    modal.innerHTML = `
        <div class="ios-install-content">
            <h3>Instalar App</h3>
            <p style="font-size: 0.85rem; color: #666; margin-bottom: 1rem;">
                Adicione o EMDA Talentos à sua tela inicial:
            </p>
            <div class="ios-install-steps">
                <div class="ios-step">
                    <span class="ios-step-icon">📤</span>
                    <span>Toque no botão <strong>Compartilhar</strong></span>
                </div>
                <div class="ios-step">
                    <span class="ios-step-icon">➕</span>
                    <span>Selecione <strong>"Adicionar à Tela Inicial"</strong></span>
                </div>
                <div class="ios-step">
                    <span class="ios-step-icon">✓</span>
                    <span>Toque em <strong>Adicionar</strong></span>
                </div>
            </div>
            <button class="ios-install-close" onclick="this.closest('.ios-install-modal').remove()">
                Entendi
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    hideInstallPrompt();
}

// ========================================
// Shake Animation
// ========================================

const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(styleSheet);
