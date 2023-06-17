
const processaPy = (function() {

// TODO: test const evaluation
// TODO: variáveis locais ? funções

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

const variaveis = new Map();
let codigoTraduzido = "";
document.addEventListener("keydown", evt => {
	if (evt.ctrlKey) {
		if (evt.key == "F2") { 
			if (evt.shiftKey) console.clear();
			document.getElementById("pythonTabButton").click();
			processa();
			return;
		}
	} 
});

const processa = () => {
	console.log("processando");
	
	variaveis.clear();
	codigoTraduzido = "";
	document.getElementById("pythonOutput").value = "";

	traduzTokens();
}

// qualquer caractere que sai do nosso "alfabeto" dá sintaxe incorreta
// ex: '
// só na string que vale tudo
const traduzTokens = () => {
	const textoDaIde = editor.getValue();

	const linhas = textoDaIde.split("\n");

	const iPrimeiraLinhaValida = transpilaPrimeiraLinhaValida(linhas);
	
	if (iPrimeiraLinhaValida == false) { return; }

	const proxLinhaValida = skipaLinhasVazias(linhas, iPrimeiraLinhaValida+1);
	if (proxLinhaValida == linhas.length - 1) {
		console.error("TA TUDO VAZIO PRA BAIXO DO NOME");
		return;
	}

	const indexInicioAlg = transpilaVars(proxLinhaValida + 1, linhas);

	for (const key of variaveis.keys()) {
		console.log("varName: " + key + " initial value: " + variaveis.get(key))
	}
	

	traduzAlgoritmo();

	document.getElementById("pythonOutput").value = codigoTraduzido;
}

/**
 * @param {String[]} linhas 
 * @returns {Number|boolean} Index da primeira linha válida ou false se der erro
 */
const transpilaPrimeiraLinhaValida = (linhas) => {
	const iPrimeiraLinhaValida = skipaLinhasVazias(linhas, 0);
	const nenhumaLinhaValida = iPrimeiraLinhaValida == linhas.length - 1 || linhas.length == 0;
	if (nenhumaLinhaValida) {
		console.log("TA TUDO VAZIO");
		return false;
	}

	const primeiraLinha = linhas[iPrimeiraLinhaValida];

	const primeiroToken = proxPalavra(primeiraLinha, 0);
	if(primeiroToken === false || primeiroToken.toLowerCase() != "algoritmo") {
		naoEsperado(iPrimeiraLinhaValida, 0, primeiraLinha.length);
	}

	let charsPercorridos = primeiroToken.length;
	charsPercorridos += contaEmBranco(primeiraLinha, charsPercorridos);
	
	const segundoToken = proxPalavra(primeiraLinha, charsPercorridos);

	if (segundoToken === false || segundoToken.startsWith("\"") == false) {
	 	alert("ERRO: Esperava-se 'Algoritmo' seguido de uma string");
		naoEsperado(iPrimeiraLinhaValida, 0, primeiraLinha.length);
	 	return false;
	}

	codigoTraduzido += "# programa " + segundoToken + "\n\n";

	return true;
}

const ehSkipavel = char => {
	return char === ' ';
}

/**
 * @return {Number}
 */
const skipaLinhasVazias = (linhas, inicio) => {
	for (let i = inicio; i < linhas.length; ++i) {
		const linha = linhas[i];
		if (estaEmBrancoOuComentario(linha) || linha.trim().startsWith("//")) continue;

		return i;
	}

	return inicio;
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

/**
 * @param {number} startIndex 
 * @param {number} linhas 
 * @returns {Number|boolean} retorna index da proxima linha ou false se der erro
 */
const transpilaVars = (startIndex, linhas) => {
	const indexInicio = varreVars(startIndex, linhas);

	if(indexInicio == false) {
		return false;
	}

	traduzVars();

	return indexInicio;
}

/**
 * @param {number} startIndex 
 * @param {number} linhas 
 * @returns {Number|boolean} retorna index da proxima linha ou false se der erro
 */
const varreVars = (startIndex, linhas) => {
	for (let i = startIndex; i < linhas.length; i++) {
		if (linhas[i].toLowerCase() == "inicio") { return i; }
		if (estaEmBrancoOuComentario(linhas[i])) { continue; }

		const tokens = linhas[i].split(":");
		if (tokens.length != 2) {
			naoEsperado(i, 0, linhas[i].length);
		}

		const varNames = tokens[0].trim().split(",");
		const type = tokens[1].trim().toLowerCase();
		
		const conseguiuSalvar = salvaVars(varNames, type);
		
		if (conseguiuSalvar == false) {
			naoEsperado(i, 0, linhas[i].length);
			return false;
		}
	}
}

/** @param {String} varName @param {String} varType @returns {Boolean} */
const salvaVars = (varNames, varType) => {
	for (const varName of varNames) {
		const trimmedName = varName.trim();

		if (varType == "inteiro" || varType == "real") {
			variaveis.set(trimmedName, 0);
		}
		else if (varType == "caracter" || varType == "caractere") {
			variaveis.set(trimmedName, "\"\"");
		}
		else if (varType == "logico") {
			variaveis.set(trimmedName, false);
		}
		else {
			return false;
		}
	}

	return true;
}

const traduzVars = () => {
	for (const varName of variaveis.keys()) {
		codigoTraduzido += `${varName} = ${variaveis.get(varName)}\n`
	}
}

/** @param {String} linha @param {Number} comeco @returns {String} */
const proxPalavra = (linha, comeco) => {
	// console.log(`catando prox palavra em '${linha}'`);
	const acabou = comeco == linha.length;
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
	// console.log(`token ${token}`);
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

const contaEmBranco = (linha, comeco) => {
	let i;
	for (i = comeco; i < linha.length; ++i) {
		const char = linha[i];
		if (ehSkipavel(char)) continue;
		return i - comeco;
	}
	return i - comeco;
}

const naoEsperado = (indiceLinha, indiceColuna, tamanhoToken) => {
    console.error(`token nao esperado na linha '${indiceLinha+1}' coluna '${indiceColuna}'`);
    atualizaCursorNoErro(indiceLinha, indiceColuna, tamanhoToken);
}

const atualizaCursorNoErro = (indiceLinha, indiceColuna, tamanhoToken) => {
    if (!tamanhoToken) tamanhoToken = 0;
    if (!indiceColuna) indiceColuna = 0;
    editor.selection.$setSelection(indiceLinha, indiceColuna, indiceLinha, indiceColuna + tamanhoToken);
}

const traduzAlgoritmo = () => {
	//TODO: vai tokenizando e traduzindo algoritmo
}


return processa;
})()