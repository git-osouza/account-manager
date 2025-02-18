<template>
    <div v-if="show" class="modal fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" :class="modalSizeClass">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Detalhes da Conta</h5>
                    <button type="button" class="btn-close" @click="$emit('close')"></button>
                </div>
                <div class="modal-body">
                    <div class="table-responsive">
                        <table v-if="accountsDetail.length > 0" class="table table-striped table-hover">
                            <thead class="table-dark" style="font-size: small;">
                                <tr>
                                    <th>Parcela</th>
                                    <th>Valor</th>
                                    <th>Data venc.</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="detail in accountsDetail" :key="detail.id">
                                    <td>{{ detail.numero_parcela }}</td>
                                    <td> {{ formattedValue(detail.valor_parcela) }}</td>
                                    <td class="text-center">{{ detail.dt_vencimento }}</td>
                                    <td class="text-center">{{ detail.status }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script>
export default {
    name: 'AccountDetalhesModalComponent',
    data() {
        return {
        };
    },
    methods: {
        formattedValue(value) {
            console.log(value);
            return `R$ ${value.toFixed(2).replace('.', ',')}`;
        }
    },
    props: {
        show: Boolean,
        accountsDetail: Array,
        size: {
            type: String,
            default: "md",
            validator: (value) => ["sm", "md", "lg", "xl", "custom"].includes(value),
        },
    },
    computed: {
        modalSizeClass() {
            return {
                sm: "modal-sm",
                md: "",
                lg: "modal-lg",
                xl: "modal-xl",
                custom: "custom-modal-size",
            }[this.size];
        }
    },
};
</script>

<style scoped>
.custom-modal-size {
    max-width: 80vw;
}
</style>