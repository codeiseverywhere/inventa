const BR_STATES = [
  ["Acre", "AC"],
  ["Alagoas", "AL"],
  ["Amapá", "AP"],
  ["Amazonas", "AM"],
  ["Bahia", "BA"],
  ["Ceará", "CE"],
  ["Distrito Federal", "DF"],
  ["Espírito Santo", "ES"],
  ["Goiás", "GO"],
  ["Maranhão", "MA"],
  ["Mato Grosso", "MT"],
  ["Mato Grosso do Sul", "MS"],
  ["Minas Gerais", "MG"],
  ["Paraná", "PR"],
  ["Paraíba", "PB"],
  ["Pará", "PA"],
  ["Pernambuco", "PE"],
  ["Piauí", "PI"],
  ["Rio Grande do Norte", "PN"],
  ["Rio Grande do Sul", "RS"],
  ["Rio de Janeiro", "RJ"],
  ["Rondônia", "RO"],
  ["Roraima", "RR"],
  ["Santa Catarina", "SC"],
  ["Sergipe", "SE"],
  ["São Paulo", "SP"],
  ["Tocantins", "TO"],
];
function getStateCode(state) {
  if (state) {
    const state_down = state.toLowerCase();
    const found = BR_STATES.find((e) => e[0].toLowerCase() == state_down);
    if (found) return found[1];
    else return null;
  } else return null;
}
