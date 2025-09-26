// Exemplo simples para exibir alerta ao enviar formulário
document.querySelector("form").addEventListener("submit", function(e) {
  e.preventDefault();
  alert("Mensagem enviada com sucesso!");
});