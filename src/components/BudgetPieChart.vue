<template>
  <div class="budget-pie-section">
    <div class="glass-card budget-pie-card">
      <div class="card-glow-indigo" />

      <div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
        <div>
          <h4 class="fw-bold mb-1 text-white d-flex align-items-center gap-2">
            <div class="icon-wrapper bg-indigo-glow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="text-indigo" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.25-14.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 1.5 0M12.5 8a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0"/>
              </svg>
            </div>
            Método 70/20/10
          </h4>
          <p class="text-secondary small mb-0">
            Distribuição ideal do seu orçamento mensal
          </p>
        </div>

        <!-- Seletor de mês/ano -->
        <div class="d-flex gap-2 align-items-center">
          <select
            v-model="selectedMonth"
            class="form-select pie-select"
            @change="fetchMonthData"
          >
            <option v-for="(m, i) in monthNames" :key="i" :value="i">{{ m }}</option>
          </select>
          <select
            v-model="selectedYear"
            class="form-select pie-select"
            @change="fetchMonthData"
          >
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <!-- Salary input inline -->
      <div class="salary-row mb-4">
        <div class="salary-input-group">
          <span class="text-secondary small fw-semibold uppercase-label">Salário Base</span>
          <div class="d-flex align-items-center gap-1 mt-1">
            <span class="currency-label text-secondary font-monospace">R$</span>
            <input
              v-model.number="salary"
              type="number"
              class="salary-input-field"
              placeholder="0,00"
              @change="saveSalary"
            >
          </div>
        </div>
      </div>

      <div v-if="salary > 0" class="pie-content-wrapper">
        <!-- SVG Pie Chart -->
        <div class="pie-chart-container">
          <svg viewBox="0 0 200 200" class="pie-chart-svg">
            <defs>
              <linearGradient id="grad-gastos" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#818cf8;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="grad-poupanca" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#34d399;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="grad-doacoes" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#fbbf24;stop-opacity:1" />
              </linearGradient>
              <filter id="pie-shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
              </filter>
            </defs>

            <!-- Background circle -->
            <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>

            <!-- Pie Segments -->
            <path
              v-for="(seg, idx) in pieSegments"
              :key="idx"
              :d="seg.path"
              :fill="seg.gradient"
              :class="['pie-segment', { 'pie-segment-hover': hoveredSegment === idx }]"
              filter="url(#pie-shadow)"
              @mouseenter="hoveredSegment = idx"
              @mouseleave="hoveredSegment = null"
            />

            <!-- Center circle (donut hole) -->
            <circle cx="100" cy="100" r="45" :fill="centerFill" class="donut-hole"/>

            <!-- Center text -->
            <text x="100" y="93" text-anchor="middle" class="center-label">Total Gasto</text>
            <text x="100" y="112" text-anchor="middle" class="center-value">{{ usedPercentage }}%</text>
          </svg>
        </div>

        <!-- Legend and details -->
        <div class="pie-legend">
          <div
            v-for="(cat, idx) in categories"
            :key="cat.key"
            :class="['legend-item', { 'legend-item-active': hoveredSegment === idx }]"
            @mouseenter="hoveredSegment = idx"
            @mouseleave="hoveredSegment = null"
          >
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="legend-dot" :style="{ background: cat.color }" />
              <span class="legend-label">{{ cat.label }}</span>
              <span class="legend-target">({{ cat.targetPct }}%)</span>
            </div>
            <div class="legend-values">
              <div class="legend-ideal">
                <span class="text-secondary small">Ideal:</span>
                <span class="fw-semibold font-monospace text-white">{{ formattedValue(cat.idealAmount) }}</span>
              </div>
              <div class="legend-real">
                <span class="text-secondary small">Gasto:</span>
                <span :class="['fw-bold font-monospace', cat.spent > cat.idealAmount ? 'text-over' : 'text-under']">
                  {{ formattedValue(cat.spent) }}
                </span>
              </div>
            </div>
            <!-- Mini progress bar -->
            <div class="mini-progress-bar mt-2">
              <div
                class="mini-progress-fill"
                :style="{
                  width: Math.min((cat.spent / cat.idealAmount) * 100, 100) + '%',
                  background: cat.spent > cat.idealAmount ? '#f43f5e' : cat.color
                }"
              />
              <div
                v-if="cat.spent > cat.idealAmount"
                class="mini-progress-overflow"
                :style="{ width: Math.min(((cat.spent - cat.idealAmount) / cat.idealAmount) * 100, 50) + '%' }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-state-pie text-center py-4">
        <div class="empty-icon mx-auto mb-3">💰</div>
        <p class="text-secondary mb-0">
          Informe seu salário para visualizar a distribuição 70/20/10.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import supabase from '@/utils/supabase';

export default {
  name: 'BudgetPieChart',
  setup() {
    const salary = ref(0);
    const totalSpent = ref(0);
    const spentByBucket = ref({ gastos: 0, poupanca: 0, doacoes: 0 });
    const hoveredSegment = ref(null);
    const selectedMonth = ref(new Date().getMonth());
    const selectedYear = ref(new Date().getFullYear());

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const years = computed(() => {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
    });

    // Category mapping: which expense categories go into which 70/20/10 bucket
    const categoryToBucket = {
      'despesas-fixas': 'gastos',
      'transporte': 'gastos',
      'alimentacao': 'gastos',
      'saude': 'gastos',
      'educacao': 'gastos',
      'manutencao-casa': 'gastos',
      'lazer-entretenimento': 'gastos',
      'despesas-pessoais': 'gastos',
      'dividas-pagamentos': 'doacoes',
      'investimentos-poupanca': 'poupanca',
    };

    const categories = computed(() => [
      {
        key: 'gastos',
        label: 'Gastos Gerais',
        targetPct: 70,
        color: '#6366f1',
        idealAmount: salary.value * 0.7,
        spent: spentByBucket.value.gastos,
      },
      {
        key: 'poupanca',
        label: 'Poupança',
        targetPct: 20,
        color: '#10b981',
        idealAmount: salary.value * 0.2,
        spent: spentByBucket.value.poupanca,
      },
      {
        key: 'doacoes',
        label: 'Dívidas/Doações',
        targetPct: 10,
        color: '#f59e0b',
        idealAmount: salary.value * 0.1,
        spent: spentByBucket.value.doacoes,
      },
    ]);

    const usedPercentage = computed(() => {
      if (salary.value <= 0) return 0;
      return Math.round((totalSpent.value / salary.value) * 100);
    });

    const centerFill = computed(() => {
      return 'rgba(11, 15, 25, 0.92)';
    });

    // Build SVG pie segments
    const pieSegments = computed(() => {
      if (salary.value <= 0) return [];

      const total = salary.value;
      const data = categories.value.map(c => ({
        value: Math.max(c.spent, 0),
        gradient: `url(#grad-${c.key})`,
      }));

      // If nothing spent, show equal placeholder slices
      const sum = data.reduce((s, d) => s + d.value, 0);
      if (sum === 0) {
        return categories.value.map((c, i) => ({
          path: describeArc(100, 100, 80, i * 120, (i + 1) * 120),
          gradient: `url(#grad-${c.key})`,
        }));
      }

      const segments = [];
      let startAngle = -90;

      data.forEach((d) => {
        const pct = d.value / total;
        const angle = pct * 360;
        const endAngle = startAngle + Math.max(angle, 1);

        segments.push({
          path: describeArc(100, 100, 80, startAngle, endAngle),
          gradient: d.gradient,
        });

        startAngle = endAngle;
      });

      return segments;
    });

    function describeArc(cx, cy, r, startAngle, endAngle) {
      const clampedEnd = Math.min(endAngle, startAngle + 359.99);
      const start = polarToCartesian(cx, cy, r, clampedEnd);
      const end = polarToCartesian(cx, cy, r, startAngle);
      const largeArcFlag = clampedEnd - startAngle > 180 ? 1 : 0;

      return [
        'M', cx, cy,
        'L', start.x, start.y,
        'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
        'Z'
      ].join(' ');
    }

    function polarToCartesian(cx, cy, r, angleDeg) {
      const rad = (angleDeg * Math.PI) / 180.0;
      return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
      };
    }

    function formattedValue(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    }

    function saveSalary() {
      localStorage.setItem(`monthlySalary-${selectedMonth.value}`, JSON.stringify(salary.value));
    }

    function loadSalary() {
      const saved = localStorage.getItem(`monthlySalary-${selectedMonth.value}`);
      salary.value = saved ? JSON.parse(saved) : 0;
    }

    async function fetchMonthData() {
      loadSalary();

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return;

        const startOfMonth = new Date(selectedYear.value, selectedMonth.value, 1).toISOString();
        const endOfMonth = new Date(selectedYear.value, selectedMonth.value + 1, 0).toISOString();

        const { data: parcelas, error: fetchError } = await supabase
          .from('account_parcelas')
          .select('valor_parcela, account:id_account(categoria, user_id)')
          .gte('dt_vencimento', startOfMonth)
          .lte('dt_vencimento', endOfMonth)
          .is('dt_pagamento', null);

        if (fetchError) {
          console.error('Erro ao buscar parcelas para gráfico:', fetchError);
          return;
        }

        // Filter by user & group by bucket
        const buckets = { gastos: 0, poupanca: 0, doacoes: 0 };
        let total = 0;

        parcelas.forEach(p => {
          if (!p.account || p.account.user_id !== user.id) return;
          const bucket = categoryToBucket[p.account.categoria] || 'gastos';
          const val = Number(p.valor_parcela || 0);
          buckets[bucket] += val;
          total += val;
        });

        spentByBucket.value = buckets;
        totalSpent.value = total;
      } catch (err) {
        console.error('Erro no gráfico de orçamento:', err);
      }
    }

    onMounted(fetchMonthData);

    watch([selectedMonth, selectedYear], fetchMonthData);

    return {
      salary,
      totalSpent,
      hoveredSegment,
      selectedMonth,
      selectedYear,
      monthNames,
      years,
      categories,
      usedPercentage,
      centerFill,
      pieSegments,
      formattedValue,
      saveSalary,
      fetchMonthData,
    };
  },
};
</script>

<style scoped>
.budget-pie-section {
  margin-top: 2rem;
}

.budget-pie-card {
  position: relative;
  overflow: hidden;
}

.card-glow-indigo {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.icon-wrapper.bg-indigo-glow-sm {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background-color: rgba(99, 102, 241, 0.15);
}

.text-indigo {
  color: #818cf8;
}

.uppercase-label {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Selects */
.pie-select {
  height: 36px !important;
  font-size: 0.8rem !important;
  border-radius: 8px !important;
  min-width: 100px;
  padding: 0.25rem 2rem 0.25rem 0.5rem !important;
}

/* Salary */
.salary-row {
  display: flex;
  align-items: center;
}

.salary-input-group {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  width: 100%;
  max-width: 300px;
}

.currency-label {
  font-size: 1.1rem;
}

.salary-input-field {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  width: 100%;
  max-width: 180px;
  outline: none;
  padding: 0;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.salary-input-field::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

/* Pie content layout */
.pie-content-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 2.5rem;
  flex-wrap: wrap;
}

/* Pie chart */
.pie-chart-container {
  flex: 0 0 220px;
  width: 220px;
  height: 220px;
  position: relative;
}

.pie-chart-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

.pie-segment {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  opacity: 0.9;
}

.pie-segment:hover,
.pie-segment-hover {
  opacity: 1;
  transform-origin: 100px 100px;
  transform: scale(1.04);
  filter: brightness(1.15);
}

.donut-hole {
  transition: fill 0.3s ease;
}

.center-label {
  fill: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  font-weight: 500;
}

.center-value {
  fill: #fff;
  font-size: 20px;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

/* Legend */
.pie-legend {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.legend-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  transition: all 0.25s ease;
  cursor: default;
}

.legend-item:hover,
.legend-item-active {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateX(4px);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  font-weight: 600;
  color: #fff;
  font-size: 0.9rem;
}

.legend-target {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  font-weight: 500;
}

.legend-values {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.25rem;
  padding-left: 1.125rem;
}

.legend-ideal,
.legend-real {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.text-over {
  color: #f43f5e;
}

.text-under {
  color: #10b981;
}

/* Mini progress bar */
.mini-progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  margin-left: 1.125rem;
}

.mini-progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.mini-progress-overflow {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  background: rgba(244, 63, 94, 0.6);
  border-radius: 0 4px 4px 0;
  animation: pulse-overflow 1.5s ease-in-out infinite;
}

@keyframes pulse-overflow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Empty state */
.empty-state-pie {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .pie-content-wrapper {
    flex-direction: column;
    align-items: center;
  }

  .pie-chart-container {
    flex: 0 0 200px;
    width: 200px;
    height: 200px;
  }

  .pie-legend {
    width: 100%;
  }

  .salary-input-group {
    max-width: 100%;
  }
}
</style>
