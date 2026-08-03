<template>
  <div class="ai-assistant-container">
    <!-- Header do Assistente -->
    <div class="glass-card ai-header mb-4">
      <div class="card-glow-ai" />
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="ai-avatar">
            <span class="ai-avatar-emoji">🤖</span>
            <span class="ai-avatar-pulse" />
          </div>
          <div>
            <h3 class="fw-bold mb-0 text-white">
              Consultor Financeiro IA
            </h3>
            <p class="text-secondary small mb-0">
              Powered by DeepSeek · Agente de economia pessoal
            </p>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button
            v-if="isConfigured"
            class="btn-config-small"
            title="Reconfigurar API Key"
            @click="showConfig = !showConfig"
          >
            ⚙️
          </button>
          <span :class="['connection-badge', isConfigured ? 'connected' : 'disconnected']">
            {{ isConfigured ? '● Conectado' : '○ Não configurado' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Config Panel -->
    <div v-if="showConfig || !isConfigured" class="glass-card config-panel mb-4">
      <div class="d-flex align-items-center gap-2 mb-3">
        <span class="config-icon">🔑</span>
        <h5 class="fw-bold mb-0 text-white">
          Configurar API Key do DeepSeek
        </h5>
      </div>
      <p class="text-secondary small mb-3">
        Insira sua chave de API do DeepSeek para ativar o assistente. 
        Obtenha sua chave em <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener" class="config-link">platform.deepseek.com</a>.
        A chave é armazenada apenas no seu navegador.
      </p>
      <div class="d-flex gap-2 flex-wrap">
        <div class="api-key-input-wrapper flex-grow-1">
          <input
            v-model="apiKeyInput"
            :type="showApiKey ? 'text' : 'password'"
            class="api-key-input"
            placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
            @keyup.enter="saveKey"
          >
          <button class="toggle-visibility-btn" @click="showApiKey = !showApiKey">
            {{ showApiKey ? '🙈' : '👁️' }}
          </button>
        </div>
        <button
          class="btn-primary-gradient px-4 d-flex align-items-center gap-2"
          :disabled="isValidating"
          @click="saveKey"
        >
          <span v-if="isValidating" class="spinner-sm" />
          <span>{{ isValidating ? 'Validando...' : 'Salvar Chave' }}</span>
        </button>
      </div>
      <div v-if="configMessage" :class="['config-message mt-2', configMessage.type]">
        {{ configMessage.text }}
      </div>
      <button
        v-if="isConfigured"
        class="btn-remove-key mt-2"
        @click="removeKey"
      >
        🗑️ Remover chave
      </button>
    </div>

    <!-- Chat Area -->
    <div v-if="isConfigured" class="glass-card chat-area">
      <!-- Messages -->
      <div ref="messagesContainer" class="messages-container">
        <!-- Welcome message -->
        <div v-if="chatMessages.length === 0" class="welcome-section">
          <div class="welcome-icon mb-3">💡</div>
          <h5 class="fw-bold text-white mb-2">
            Como posso te ajudar?
          </h5>
          <p class="text-secondary small mb-4">
            Tenho acesso aos seus dados financeiros e posso analisar sua situação, 
            sugerir estratégias de economia e ajudar a organizar suas contas.
          </p>

          <!-- Quick suggestions -->
          <div class="suggestions-grid">
            <button
              v-for="s in suggestions"
              :key="s.text"
              class="suggestion-btn"
              @click="sendSuggestion(s.text)"
            >
              <span class="suggestion-icon">{{ s.icon }}</span>
              <span class="suggestion-text">{{ s.text }}</span>
            </button>
          </div>
        </div>

        <!-- Chat messages -->
        <div
          v-for="(msg, idx) in chatMessages"
          :key="idx"
          :class="['message-bubble', msg.role === 'user' ? 'user-message' : 'ai-message']"
        >
          <div class="message-avatar">
            {{ msg.role === 'user' ? '👤' : '🤖' }}
          </div>
          <div class="message-content">
            <div class="message-sender">
              {{ msg.role === 'user' ? 'Você' : 'Consultor IA' }}
            </div>
            <div class="message-text" v-html="formatMessage(msg.content)" />
            <div class="message-time">{{ msg.time }}</div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="message-bubble ai-message">
          <div class="message-avatar">
            🤖
          </div>
          <div class="message-content">
            <div class="message-sender">
              Consultor IA
            </div>
            <div class="typing-indicator">
              <span class="dot" />
              <span class="dot" />
              <span class="dot" />
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="error-toast">
          <span>⚠️ {{ errorMessage }}</span>
          <button class="error-dismiss" @click="errorMessage = null">✕</button>
        </div>
      </div>

      <!-- Input area -->
      <div class="chat-input-area">
        <div class="input-wrapper">
          <textarea
            ref="chatInput"
            v-model="userInput"
            class="chat-input"
            placeholder="Pergunte sobre suas finanças..."
            rows="1"
            :disabled="isLoading"
            @keydown.enter.exact.prevent="sendUserMessage"
            @input="autoResize"
          />
          <button
            class="send-btn"
            :disabled="!userInput.trim() || isLoading"
            @click="sendUserMessage"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
            </svg>
          </button>
        </div>
        <div class="input-footer">
          <span class="text-secondary" style="font-size: 0.7rem;">
            A IA analisa apenas seus dados reais cadastrados. Sem alucinações.
          </span>
          <button
            v-if="chatMessages.length > 0"
            class="clear-chat-btn"
            @click="clearChat"
          >
            🗑️ Limpar conversa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, onMounted } from 'vue';
import {
  getApiKey,
  saveApiKey,
  removeApiKey,
  hasApiKey,
  validateApiKey,
  buildFinancialContext,
  sendMessage,
} from '@/services/ai/deepseekService';

export default {
  name: 'AssistenteIAView',
  setup() {
    const apiKeyInput = ref('');
    const showApiKey = ref(false);
    const showConfig = ref(false);
    const isConfigured = ref(false);
    const isValidating = ref(false);
    const configMessage = ref(null);
    const chatMessages = ref([]);
    const userInput = ref('');
    const isLoading = ref(false);
    const errorMessage = ref(null);
    const financialContext = ref('');
    const messagesContainer = ref(null);
    const chatInput = ref(null);

    const suggestions = [
      { icon: '📊', text: 'Faça uma análise completa do meu orçamento' },
      { icon: '🔥', text: 'Quais contas devo priorizar para pagar primeiro?' },
      { icon: '💰', text: 'Como posso economizar mais esse mês?' },
      { icon: '📉', text: 'Estou seguindo bem o método 70/20/10?' },
      { icon: '⚠️', text: 'Tenho contas em atraso? O que fazer?' },
      { icon: '🔮', text: 'Como vão ficar minhas contas nos próximos meses?' },
    ];

    onMounted(async () => {
      isConfigured.value = hasApiKey();
      if (isConfigured.value) {
        apiKeyInput.value = getApiKey();
        await loadFinancialContext();
      }
    });

    async function loadFinancialContext() {
      financialContext.value = await buildFinancialContext();
    }

    async function saveKey() {
      if (!apiKeyInput.value.trim()) {
        configMessage.value = { type: 'error', text: 'Insira uma API key válida.' };
        return;
      }

      isValidating.value = true;
      configMessage.value = null;

      const result = await validateApiKey(apiKeyInput.value.trim());

      if (result.valid) {
        saveApiKey(apiKeyInput.value.trim());
        isConfigured.value = true;
        showConfig.value = false;
        configMessage.value = { type: 'success', text: '✅ API key validada e salva com sucesso!' };
        await loadFinancialContext();
      } else {
        configMessage.value = { type: 'error', text: `❌ ${result.error}` };
      }

      isValidating.value = false;
    }

    function removeKey() {
      removeApiKey();
      apiKeyInput.value = '';
      isConfigured.value = false;
      showConfig.value = false;
      chatMessages.value = [];
      configMessage.value = null;
    }

    function getCurrentTime() {
      return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    async function sendUserMessage() {
      const text = userInput.value.trim();
      if (!text || isLoading.value) return;

      // Add user message
      chatMessages.value.push({
        role: 'user',
        content: text,
        time: getCurrentTime(),
      });

      userInput.value = '';
      resetTextareaHeight();
      isLoading.value = true;
      errorMessage.value = null;

      await scrollToBottom();

      try {
        // Refresh financial context before each message
        await loadFinancialContext();

        const historyForApi = chatMessages.value.map(m => ({
          role: m.role,
          content: m.content,
        }));

        const response = await sendMessage(historyForApi, financialContext.value);

        chatMessages.value.push({
          role: 'assistant',
          content: response,
          time: getCurrentTime(),
        });
      } catch (err) {
        errorMessage.value = err.message;
      } finally {
        isLoading.value = false;
        await scrollToBottom();
      }
    }

    function sendSuggestion(text) {
      userInput.value = text;
      sendUserMessage();
    }

    function clearChat() {
      chatMessages.value = [];
      errorMessage.value = null;
    }

    function formatMessage(text) {
      if (!text) return '';

      let html = text
        // Escape HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Inline code
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Headers
        .replace(/^### (.*$)/gm, '<h6 class="ai-heading">$1</h6>')
        .replace(/^## (.*$)/gm, '<h5 class="ai-heading">$1</h5>')
        .replace(/^# (.*$)/gm, '<h4 class="ai-heading">$1</h4>')
        // Unordered list items
        .replace(/^[-•] (.*$)/gm, '<li>$1</li>')
        // Ordered list items
        .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
        // Wrap consecutive <li> in <ul>
        .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul class="ai-list">$1</ul>')
        // Line breaks
        .replace(/\n/g, '<br>');

      return html;
    }

    async function scrollToBottom() {
      await nextTick();
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    }

    function autoResize(event) {
      const textarea = event.target;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    function resetTextareaHeight() {
      nextTick(() => {
        if (chatInput.value) {
          chatInput.value.style.height = 'auto';
        }
      });
    }

    return {
      apiKeyInput,
      showApiKey,
      showConfig,
      isConfigured,
      isValidating,
      configMessage,
      chatMessages,
      userInput,
      isLoading,
      errorMessage,
      suggestions,
      messagesContainer,
      chatInput,
      saveKey,
      removeKey,
      sendUserMessage,
      sendSuggestion,
      clearChat,
      formatMessage,
      autoResize,
    };
  },
};
</script>

<style scoped>
.ai-assistant-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

/* Header */
.ai-header {
  position: relative;
  overflow: hidden;
}

.card-glow-ai {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.ai-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.ai-avatar-emoji {
  font-size: 1.5rem;
  z-index: 1;
}

.ai-avatar-pulse {
  position: absolute;
  inset: -3px;
  border-radius: 16px;
  border: 2px solid rgba(99, 102, 241, 0.4);
  animation: avatar-pulse 2s ease-in-out infinite;
}

@keyframes avatar-pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.connection-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.7rem;
  border-radius: 9999px;
  letter-spacing: 0.02em;
}

.connection-badge.connected {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.connection-badge.disconnected {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.btn-config-small {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.35rem 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-config-small:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Config Panel */
.config-panel {
  border: 1px solid rgba(99, 102, 241, 0.15);
}

.config-icon {
  font-size: 1.3rem;
}

.config-link {
  color: #818cf8;
  text-decoration: none;
}

.config-link:hover {
  text-decoration: underline;
  color: #a5b4fc;
}

.api-key-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.api-key-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: #fff;
  padding: 0.7rem 3rem 0.7rem 1rem;
  font-size: 0.9rem;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  width: 100%;
  outline: none;
  transition: border-color 0.2s ease;
}

.api-key-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.api-key-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.toggle-visibility-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
}

.config-message {
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
}

.config-message.success {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.config-message.error {
  color: #f43f5e;
  background: rgba(244, 63, 94, 0.1);
}

.btn-remove-key {
  background: none;
  border: none;
  color: #f43f5e;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-remove-key:hover {
  opacity: 1;
}

.spinner-sm {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Chat Area */
.chat-area {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  min-height: 500px;
  max-height: 70vh;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Welcome */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 1rem;
  flex: 1;
}

.welcome-icon {
  font-size: 3rem;
  opacity: 0.8;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.6rem;
  width: 100%;
  max-width: 600px;
}

.suggestion-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  text-align: left;
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.suggestion-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.25);
  color: #fff;
  transform: translateY(-2px);
}

.suggestion-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* Messages */
.message-bubble {
  display: flex;
  gap: 0.75rem;
  max-width: 85%;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.ai-message {
  align-self: flex-start;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.user-message .message-avatar {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.25);
}

.message-content {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 0.75rem 1rem;
  min-width: 60px;
}

.user-message .message-content {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.2);
}

.message-sender {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.message-text {
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.6;
  word-wrap: break-word;
}

.message-text :deep(h4.ai-heading),
.message-text :deep(h5.ai-heading),
.message-text :deep(h6.ai-heading) {
  color: #a5b4fc;
  margin-top: 0.75rem;
  margin-bottom: 0.4rem;
  font-weight: 700;
}

.message-text :deep(ul.ai-list) {
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}

.message-text :deep(ul.ai-list li) {
  margin-bottom: 0.25rem;
}

.message-text :deep(strong) {
  color: #fff;
}

.message-text :deep(code) {
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-family: 'JetBrains Mono', monospace;
}

.message-time {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 0.35rem;
  text-align: right;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 0.25rem 0;
}

.typing-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  animation: typing 1.4s ease-in-out infinite;
}

.typing-indicator .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-4px); }
}

/* Error */
.error-toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.25);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: #f43f5e;
  font-size: 0.85rem;
  animation: fadeInUp 0.3s ease;
}

.error-dismiss {
  background: none;
  border: none;
  color: #f43f5e;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.error-dismiss:hover {
  opacity: 1;
}

/* Input */
.chat-input-area {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.15);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 0.5rem 0.5rem 0.5rem 1rem;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.9rem;
  resize: none;
  outline: none;
  line-height: 1.5;
  max-height: 120px;
  min-height: 24px;
  font-family: inherit;
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: none;
  background: var(--primary-gradient);
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding: 0 0.25rem;
}

.clear-chat-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.7rem;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.2s;
}

.clear-chat-btn:hover {
  opacity: 1;
  color: #f43f5e;
}

/* Responsive */
@media (max-width: 768px) {
  .ai-assistant-container {
    max-width: 100%;
  }

  .chat-area {
    max-height: 65vh;
    min-height: 400px;
  }

  .suggestions-grid {
    grid-template-columns: 1fr;
  }

  .message-bubble {
    max-width: 95%;
  }
}
</style>
