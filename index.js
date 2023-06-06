

// TODO: test const evaluation
// TODO: variáveis locais ? funções


const tabelitaEl   = document.getElementById("table");
const tabelitaEl2  = tabelitaEl.getElementsByTagName("tbody");
const reservadasEl = document.getElementById("reservadas");

// TODO: até, então, faça, fimfunção, função, não, senão

// fonte: https://visualg3.com.br/tabelas/
const palavrasReservadas = [
	"aleatorio",
	"algoritmo",
	"arquivo",
	"asc",
	"ate",
	"carac",
	"caracpnum",
	"caracter",
	"caractere",
	"caso",
	"compr",
	"copia",
	"cronometro",
	"debug",
	"div",
	"e",
	"eco",
	"enquanto",
	"entao",
	"escolha",
	"escreva",
	"escreval",
	"faca",
	"falso",
	"fimalgoritmo",
	"fimenquanto",
	"fimescolha",
	"fimfuncao",
	"fimpara",
	"fimprocedimento",
	"fimrepita",
	"fimse",
	"funcao",
	"inicio",
	"int",
	"inteiro",
	"interrompa",
	"leia",
	"limpatela",
	"logico",
	"maiusc",
	"minusc",
	"mod",
	"mudacor",
	"nao",
	"numpcarac",
	"ou",
	"outrocaso",
	"para",
	"passo",
	"pausa",
	"pos",
	"procedimento",
	"real",
	"repita",
	"retorne",
	"se",
	"senao",
	"timer",
	"var",
	"verdadeiro",
	"vetor",
	"xou",
]

const operadoresAritimeticos = [
	"^",
	"*",
	"/",
	"\\",
	"+",
	"-",
	"*",
]

const operadoresRelacionais = [
	">",
	"<",
	"=",
	">=",
	"<=",
	"<>",
]

const operadoresLogicos = [
	"nao",
	"ou",
	"e",
	"xou",
]


const contadoresHtml = [];

for (const palavraReservada of palavrasReservadas) {
	// console.log(palavraReservada);
	
	const linha = document.createElement("tr");

	const colunaPalavraRes = document.createElement("td");
	colunaPalavraRes.textContent = palavraReservada;
	
	const colunaContador = document.createElement("td");
	colunaContador.textContent = 0;

	linha.appendChild(colunaPalavraRes);
	linha.appendChild(colunaContador);
	tabelitaEl.appendChild(linha);

	contadoresHtml.push(colunaContador);
}


const processa = () => {
	console.log("processando");
	
	traduzTokens();
}

// qualquer caractere que sai do nosso "alfabeto" dá sintaxe incorreta
// ex: '
// só na string que vale tudo
const traduzTokens = () => {
	const textoDaIde = editor.getValue();

	const linhas = textoDaIde.split("\n");

	const iPrimeiraLinhaValida = skipaLinhasVazias(linhas);
	const nenhumaLinhaValida = iPrimeiraLinhaValida == linhas.lengh - 1;
	if (nenhumaLinhaValida) {
		console.log("TA TUDO VAZIO");
		return;
	}

	const primeiraLinha = linhas[iPrimeiraLinhaValida];
	const prox = tokenizaProx(primeiraLinha);

	
}


const tokenizaProx = string => {
	for (let i = 0; i < string.length; ++i) {
		const char = string[i];
		if (ehSkipavel(char)) continue;

		const tamanhoDoToken = extraiTamanhoToken(string, i);
		const token = string.substring(i, tamanhoDoToken);
		// console.log(`achei token '${token}'`);
		i += token.length;
		// console.log(`skiparei em '${token.length}'`);
	}

}

const extraiTamanhoToken = (string, comeco) => {
	console.log(`extraindo a partir de ${comeco} ou '${string[comeco]}'`);
	let i;
	for (i = comeco; i < string.length; ++i) {
		const char = string[i];
		// TODO: tem tokens que nao necessitam que tenha caracteres "skipáveis" entre eles
		if (char == " ") return i;
	}
	return i;
}

const ehSkipavel = char => {
	return char === ' ';
}

/**
 * @return {Number}
 */
const skipaLinhasVazias = linhas => {
	for (let i = 0; i < linhas.length; ++i) {
		const linha = linhas[i];
		if (estaEmBranco(linha)) continue;

		return i;
	}
}

const estaEmBranco = string => {
	for (let i = 0; i < string.length; ++i) {
		if (string[i] != ' ') return false;
	}
	return true;
}
