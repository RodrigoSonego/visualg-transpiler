

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
	
	contaToken();

	traduzToken();
}

const contaToken = () => {
	const textoDaIde = editor.getValue().toLowerCase();
	
	// for (const palavraReservada of palavrasReservadas) {
	for (let i = 0; i < palavrasReservadas.length; ++i) {
		const palavraReservada = palavrasReservadas[i];
		const regex = new RegExp('^(?!\/\/).*\\b'+ palavraReservada + '\\b', "gm");
        
		contadoresHtml[i].textContent = (textoDaIde.match(regex) || []).length;
	}
}

const traduzToken = () => {
	const textoDaIde = editor.getValue().toLowerCase();

	const linhas = textoDaIde.split("\n");

	console.log(linhas.length);

	for (const linha of linhas) {
		procuraAtribuicao(linha);
	}
}

const procuraAtribuicao = (linha) => {
	const temAtribuicao = linha.includes("<-") || linha.includes(":=")

	if(temAtribuicao === false) {
		return;
	}

	console.log(linha.length)

}