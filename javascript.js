const processaJs =(function() {

const tabelitaEl   = document.getElementById("table");

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


document.addEventListener("keydown", evt => {
	if (evt.ctrlKey) {
		if (evt.key == "Enter") {  processa(); return; }
		if (evt.key == "Shift") { console.clear(); return; }
	} 
});



// const mapa = new Map();
// mapa.set("escreva", "console.log");
// mapa.set("escreva", "");


let programaTraduzido = "";
let osVar = new Map();


const processa = () => {
	programaTraduzido = "";
	osVar = new Map();

	traduzJavascript();
}


// qualquer caractere que sai do nosso "alfabeto" dá sintaxe incorreta
// ex: '
// só na string que vale tudo
const traduzJavascript = () => {
	const textoDaIde = editor.getValue();

	const linhas = textoDaIde.split("\n");

	const iPrimeiraLinhaValida = contaLinhasVazias(linhas, 0);
	const nenhumaLinhaValida = iPrimeiraLinhaValida == linhas.lengh - 1;
	if (nenhumaLinhaValida) {
		console.error("programa vazio");
		return;
	}

	// aqui sabemos que tem alguma linha válida
	const primeiraLinha = linhas[iPrimeiraLinhaValida];
	if (transpilaPrimeiraLinhaValida(primeiraLinha, iPrimeiraLinhaValida) === false) return;
	let linhasPraSkippar = contaLinhasVazias(linhas, iPrimeiraLinhaValida+1);
	
	console.log("1: ok, programa:\n" + programaTraduzido );
	
	const proxLinha = linhas[linhasPraSkippar];
	if (transpilaAteInicio(proxLinha, linhasPraSkippar) === false) return;



	return;


	for (let i = iPrimeiraLinhaValida; i < linhas.length; ++i) {
		const linha = linhas[i];
		if (estaEmBrancoOuComentario(linha)) continue;
		
		console.log(`linha '${linha}' linhas`);
		
		// tokenizaLinha(linha);
	}
}

/** @param {String} linha  @param {Number} indiceDela  @returns {Boolean|Number} */
const transpilaAteInicio = (linha, indiceDela) => {
	const charsEmBranco = contaEmBranco(linha, 0);
	linha = linha.substring(charsEmBranco);

	// primeiro token pode ser "inicio" ou "var"
	const token = proxToken(linha, 0);
	const tokenLower = token.toLowerCase();
	if (tokenLower == "inicio") {

		linha = linha.substring(6).trimStart();

		const prox = proxToken(linha, 0);
		if (prox !== false) {
			console.error(`Linha ${indiceDela+1}: Sintaxe incorreta`);
			return false;
		}

		return true;
	}

	if (tokenLower == "var") {
		linha = linha.substring(3).trimStart();
		
		// const prox = proxToken(linha.trimStart(), 0);

		adicionaVarsAposLinhaDoVars(linha);

	}

}

/** @param {String} linha  @param {Number} indiceDela  @returns {Boolean} */
const adicionaVarsAposLinhaDoVars = (linha, indiceDela) => {
	let charsAteAgora = 0;

	let charsAteAgora2 = 0;
	while (true) {
		
		const osBranco = contaEmBranco(linha, charsAteAgora);
		linha = linha.substring(osBranco);
		const prox = proxToken(linha);
		if (prox === false) break;
		
		console.log(`achei token '${prox}'`);
		
		charsAteAgora += osBranco;

		++charsAteAgora2;
		if (charsAteAgora2 == 16) break;
	}
}


/** @param {String} linha  @param {Number} indiceDela  @returns {Boolean} */
const transpilaPrimeiraLinhaValida = (linha, indiceDela) => {
	const charsEmBranco = contaEmBranco(linha, 0);
	linha = linha.substring(charsEmBranco);

	const primeiroToken = proxToken(linha, 0);
	if (primeiroToken.toLowerCase() != "algoritmo") {
		console.error(`Linha ${indiceDela+1}: Comando fora da seção apropriada`);
		return false;
	}
	
	let charsAteAgora = primeiroToken.length;
	charsAteAgora += contaEmBranco(linha, charsAteAgora);

	const segundoToken = proxToken(linha, charsAteAgora);
	if (!ehString(segundoToken)) {
		console.error(`Linha ${indiceDela+1}: Sintaxe incorreta`);
		return false;
	}

	programaTraduzido += "// programa " + segundoToken + "\n";

	charsAteAgora += segundoToken.length;
	const terceiroToken = proxToken(linha, charsAteAgora);
	if (terceiroToken !== false) {
		console.error(`Linha ${indiceDela+1}: Token nao identificado '${terceiroToken}'`);
	}

	return true;
}

/** @param {String} token  @returns {Boolean}  */
const ehString = token => {
	return token.startsWith("\"");
}

const contaEmBranco = (linha, comeco) => {
	let i;
	for (i = comeco; i < linha.length; ++i) {
		const char = linha[i];
		if (ehSkipavel(char)) continue;
		return i - comeco;
	}
	return i - comeco;
}

/** @param {String} linha @param {Number} comeco @returns {String} */
const proxToken = (linha, comeco) => {
	const acabou = comeco == linha.length - 1;
	if (acabou) return false;
	
	let i;
	for (i = comeco; i < linha.length; ++i) {
		const char = linha[i];
		if (char == "\"") {
			return extraiString(linha, i);
		}

		if (ehSkipavel(char)) break;
	}

	const token = linha.substring(comeco, i);
	if (estaEmBrancoOuComentario(token)) return false;
	return token;
}


const extraiString = (linha, comeco) => {
	// console.log(`extraindo string de ${linha.substring(comeco)}`);
	let i;
	for (i = comeco + 1; i < linha.length; ++i) {
		const char = linha[i];
		if (char == "\"") return linha.substring(comeco, i+1);
	}
	
	return false;
	// erro, string nao fechada
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
		if (estaEmBrancoOuComentario(linha)) continue;

		return i;
	}
}

const contaLinhasVazias = (linhas, comeco) => {
	for (let i = comeco; i < linhas.length; ++i) {
		const linha = linhas[i];
		if (estaEmBrancoOuComentario(linha)) continue;

		return i;
	}
}

const estaEmBrancoOuComentario = string => {
	for (let i = 0; i < string.length; ++i) {
		const char = string[i];
		if (char == "/") {
			if (string[i+1] == "/")
				return true;
			return false;
		}

		if (char != " ") return false;
	}
	return true;
}


return processa;
})()