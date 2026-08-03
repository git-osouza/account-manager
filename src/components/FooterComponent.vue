<template>
  <footer class="d-flex flex-wrap justify-content-between align-items-center py-4 my-5 border-top-premium">
    <div class="col-md-4 d-flex align-items-center">
      <span class="text-muted-custom small">© 2026 Gerenciador de Contas, Inc. Todos os direitos reservados.</span>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent'
};
</script>

<style scoped>
.border-top-premium {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.text-muted-custom {
  color: var(--text-muted);
}
</style>