export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

function aplicarMascara(valor: string, mascara: string): string {
  let resultado = "";
  let posicao = 0;
  for (const caractere of mascara) {
    if (posicao >= valor.length) break;
    if (caractere === "#") {
      resultado += valor[posicao++];
    } else {
      resultado += caractere;
    }
  }
  return resultado;
}

// O CNPJ pode conter letras nas 12 primeiras posições (IN RFB 2.229/2024).
export function formatarCnpj(valor: string): string {
  const limpo = valor.replace(/[^0-9a-zA-Z]/g, "").toUpperCase().slice(0, 14);
  return aplicarMascara(limpo, "##.###.###/####-##");
}

export function formatarCep(valor: string): string {
  return aplicarMascara(somenteDigitos(valor).slice(0, 8), "#####-###");
}

export function formatarTelefone(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, 11);
  return aplicarMascara(
    digitos,
    digitos.length > 10 ? "(##) #####-####" : "(##) ####-####",
  );
}

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const quantidade = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 });

export function formatarMoeda(valor: string): string {
  return moeda.format(Number(valor));
}

export function formatarQuantidade(valor: string): string {
  return quantidade.format(Number(valor));
}

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}
