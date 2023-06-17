
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
	const primeirosTokens = tokenizaProx(primeiraLinha);
	
	console.log(primeirosTokens);

	if (primeirosTokens[0] != "Algoritmo" || primeirosTokens[1].startsWith("\"") == false || primeirosTokens.length != 2 ) {
		console.error("ERRO: Esperava-se 'Algoritmo' seguido de uma string");
		return false;
	}

	codigoTraduzido += "# programa " + primeirosTokens[1] + "\n\n";

	return true;
}

const tokenizaProx = string => {
	const tokens = [];

	for (let i = 0; i < string.length; ++i) {
		const char = string[i];
		if (ehSkipavel(char)) continue;

		const tamanhoDoToken = extraiTamanhoToken(string, i);
		const token = string.substring(i, tamanhoDoToken);
		i += token.length;
		// console.log(`skiparei em '${token.length}'`);
		tokens.push(token);
	}

	return tokens;
}

const extraiTamanhoToken = (string, comeco) => {
	// console.log(`extraindo a partir de ${comeco} ou '${string[comeco]}'`);
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
			alert("Erro de sintaxe na linha " + (i+1));
		}

		const varNames = tokens[0].trim().split(",");
		const type = tokens[1].trim().toLowerCase();
		
		const conseguiuSalvar = salvaVars(varNames, type);
		
		if (conseguiuSalvar == false) {
			alert("Erro de sintaxe na linha " + (i+1));
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

const traduzAlgoritmo = () => {
	//TODO: vai tokenizando e traduzindo algoritmo
}


return processa;
})()