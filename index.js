
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

	const iPrimeiraLinhaValida = skipaLinhasVazias(linhas, 0);
	const nenhumaLinhaValida = iPrimeiraLinhaValida == linhas.length - 1 || linhas.length == 0;
	if (nenhumaLinhaValida) {
		console.log("TA TUDO VAZIO");
		return;
	}

	const primeiraLinha = linhas[iPrimeiraLinhaValida];
	const primeirosTokens = tokenizaProx(primeiraLinha);
	
	console.log(primeirosTokens);

	if (primeirosTokens[0] != "Algoritmo" || primeirosTokens[1].startsWith("\"") == false || primeirosTokens.length != 2 ) {
		console.log("ERRO: Esperava-se 'Algoritmo' seguido de uma string");
		return;
	}
	
	const proxLinhaValida = skipaLinhasVazias(linhas, iPrimeiraLinhaValida+1);
	console.log("prox linha valida: " + proxLinhaValida);
	if (proxLinhaValida == linhas.length - 1) {
		console.log("TA TUDO VAZIO PRA BAIXO DO NOME");
		return;
	}

	const proxToken = tokenizaProx(linhas[proxLinhaValida]);
	const isVarToken = proxToken[0].toLowerCase() == "var";

	if (isVarToken) {
		console.log("eh var")
		varreVars(proxLinhaValida + 1, linhas);
	}

	traduzAlgoritmo();
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
		if (estaEmBranco(linha) || linha.trim().startsWith("//")) continue;

		return i;
	}

	return inicio;
}

const estaEmBranco = string => {
	if (string == null) { return true; }

	for (let i = 0; i < string.length; ++i) {
		if (string[i] != ' ' || string[i] != "") return false;
	}
	return true;
}

const varreVars = (startIndex, linhas) => {
	for (let i = startIndex; i < linhas.length; i++) {
		if (linhas[i].toLowerCase() == "inicio") { return; }
		if (linhas[i].trim().startsWith("//") || linhas[i].trim() == "") { continue; }

		const tokens = linhas[i].split(":");
		if (tokens.length != 2) {
			alert("Erro de sintaxe na linha " + (i+1));
		}

		const varNames = tokens[0].trim().split(",");
		const type = tokens[1].trim().toLowerCase();
		
		console.log("names: " + varNames + " type: " + type);
		const conseguiuSalvar = salvaVars(varNames, type);
		
		if (conseguiuSalvar == false) {
			alert("Erro de sintaxe na linha " + (i+1));
			return;
		}
	}

}

/** @param {String} varName @param {String} varType @returns {Boolean} */
const salvaVars = (varNames, varType) => {
	for (const varName of varNames) {
		if (varType == "inteiro" || varType == "real") {
			variaveis.set(varName, 0);
		}
		else if (varType == "caracter" || varType == "caractere") {
			variaveis.set(varName, "");
		}
		else if (varType == "logico") {
			variaveis.set(varName, false);
		}
		else {
			return false;
		}
	}

	return true;
}

const traduzAlgoritmo = () => {
	//TODO: vai tokenizando e traduzindo algoritmo
}


return processa;
})()