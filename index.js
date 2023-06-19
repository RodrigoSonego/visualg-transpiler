
const processaPy = (function() {

const funcoes = [
	"escreva",
	"escreval"
]

const atribuicoes = [
	":=",
	"<-"
]

const variaveis = new Map();
let codigoTraduzido = "";
let tabDepth = 0;


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
	variaveis.clear();
	codigoTraduzido = "";
	tabDepth = 0;

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
	// if (proxLinhaValida == linhas.length - 1) {
	// 	console.error("TA TUDO VAZIO PRA BAIXO DO NOME");
	// 	return;
	// }

	const proximoToken = proxPalavra(linhas[proxLinhaValida], 0);
	if(proximoToken === false) {
		naoEsperado(proxLinhaValida, 0, 0);
		return;
	}

	let indexInicioAlg = -1;
	if (proximoToken.toLowerCase() === "var") {
		indexInicioAlg = transpilaVars(proxLinhaValida + 1, linhas);
		if (indexInicioAlg === false) { return; }
	}
	else if (proximoToken.toLowerCase() === "inicio") {
		indexInicioAlg = proxLinhaValida;
	}
	else {
		naoEsperado(proxLinhaValida, 0, 0);
		alert("Esperava encontrar 'Inicio'");
		return;
	}


	// for (const key of variaveis.keys()) {
	// 	console.log("varName: " + key + " initial value: " + variaveis.get(key))
	// }
	
	transpilaAlgoritmo(linhas, indexInicioAlg + 1);

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
	return char === ' ' || char === "\t";
}

/**
 * @return {Number}
 */
const skipaLinhasVazias = (linhas, inicio) => {
	for (let i = inicio; i < linhas.length; ++i) {
		const linha = linhas[i];
		if (estaEmBrancoOuComentario(linha)) continue;

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

		if (char != " " || char != "\t") return false;
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
			return;
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

/**
 * 
 * @param {String[]} linhas 
 * @param {number} indexInicio 
 */
const transpilaAlgoritmo = (linhas, indexInicio) => {
	if (indexInicio >= linhas.length) {
		naoEsperado(linhas.length - 1, 0);
		alert("ERRO: nada após inicio")
	}

	let fimseFaltando = 0;

	for (let i = indexInicio; i < linhas.length; ++i) {
		const linha = linhas[i];
		if (estaEmBrancoOuComentario(linha)) { continue; }
		
		let charsAteAgora = contaEmBranco(linha, 0)
		const primeiroToken = proxPalavra(linha, charsAteAgora);
		if (primeiroToken === false) {
			naoEsperado(i, 0, 0);
			return;
		}

		charsAteAgora += primeiroToken.length;
		charsAteAgora += contaEmBranco(linha, charsAteAgora);

		if (i === linhas.length - 1 && primeiroToken.toLowerCase() !== "fimalgoritmo") {
			naoEsperado(i, 0, 0);
			alert("ERRO: esperava encontrar 'fimalgoritmo'");
			return;
		}

		
		if(primeiroToken.toLowerCase() === "fimalgoritmo") {
			if(fimseFaltando != 0) {
				naoEsperado(i, 0, 0);
				alert("ERRO: esperava encontrar 'fimse'");
			}

			return;
		}
		
		if(primeiroToken.toLowerCase() == "se") {
			fimseFaltando++;
		}

		if(primeiroToken.toLowerCase() == "fimse") {
			if(fimseFaltando == 0) {
				naoEsperado(i, contaEmBranco(linha, 0), primeiroToken.length)
				alert("ERRO: 'fimse' encontrado sem 'se' correspondente");
				return;
			}

			fimseFaltando--;
		}

		const segundoToken = extraiSimbolo(linha, charsAteAgora);

		charsAteAgora += segundoToken.length;
		const deuBom = traduzLinhaAlgoritmo(primeiroToken, segundoToken, linha, charsAteAgora)
		if (deuBom == false) {
			naoEsperado(i, 0, linha.length);
			return;
		}
	}
}


/** @param {String} linha @param {Number} comeco @returns {String|boolean} */
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

		
		if(ehSimbolo(char)) {
			// console.log(`achei simbolo na linha ${linha}, que começa em ${comeco}`);
			break;
		}
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

/**
 * 
 * @param {String} char 
 * @returns {boolean}
 */
const ehSimbolo = char => {
	const charCode = char.toLowerCase().charCodeAt(0)

	const ehLetra = charCode >= 97 && charCode <= 122;
	const ehUnderline = charCode == 95;
	const ehNumero = charCode >= 48 && charCode <= 57;
	// console.log(`char ${char}, code: ${charCode}, é letra? ${ehLetra}, é underline? ${ehUnderline}`)

	const ehDoAlfabeto = ehLetra || ehUnderline || ehNumero;
	return ehDoAlfabeto == false;
}


/** @param {String} linha @param {number} comeco @returns {String | boolean} */
const extraiSimbolo = (linha, comeco) => {
		// console.log(`extraindo string de ${linha.substring(comeco)}`);
	let i;
	for (i = comeco; i < linha.length; ++i) {
		const char = linha[i];
		if (char === "(") {
			return extraiParenteses(linha, i);
		}

		if (ehSimbolo(char) == false || ehSkipavel(char)) {
			// console.log(`simbolo extraído: ${linha.substring(comeco, i)}`);
			return linha.substring(comeco, i);
		}

	}
	
	return false;
	// erro, não tem char
}

/** @param {String} linha  @param {number} comeco @returns {String|boolean} */
const extraiParenteses = (linha, comeco) => {
		// console.log(`extraindo string de ${linha.substring(comeco)}`);
		let i;
		for (i = comeco + 1; i < linha.length; ++i) {
			const char = linha[i];
			if (char == "\)") return linha.substring(comeco, i+1);
		}
		
		return false;
		// erro, parenteses nao fechados
}

/**
 * 
 * @param {String} primeiroToken 
 * @param {String} segundoToken 
 * @param {String} linha 
 * @param {number} charsAteAgora 
 */
const traduzLinhaAlgoritmo = (primeiroToken, segundoToken, linha, charsAteAgora) => {
	// console.log(`1st token: ${primeiroToken}  2nd token: ${segundoToken},  linha: ${linha}, chars: ${charsAteAgora}`)
	if (atribuicoes.includes(segundoToken)) {
		for (const varName of variaveis.keys()) {
			if(varName !== primeiroToken) { continue; }
			insertTabs();

			let atribuicao = linha.substring(charsAteAgora).trim();
			if(variaveis.get(varName) === false) {
				atribuicao = atribuicao.toLowerCase().replace("verdadeiro", "true").replace("falso", "false")
					.replace(" e ", " & ").replace(" ou ", " | ").replace(" nao ", " !").replace("=","==");
			}

			codigoTraduzido += `${varName} = ${atribuicao}\n`;
			return true;
		}

		return false;
	}

	if (funcoes.includes(primeiroToken)) {
		if(primeiroToken === "escreva" || primeiroToken === "escreval") {
			insertTabs();
			codigoTraduzido += `print${segundoToken ? segundoToken : "()"}\n`;
			return true;
		}

		return false;
	}

	if(primeiroToken == "se") {
		const comeco = contaEmBranco(linha, 0) + 2;
		const condicao = extraiCondicaoSe(linha, comeco);
		if(condicao === false) {
			return false;
		}
	
		insertTabs();

		const condicaoTraduzida = condicao.replace(" e ", " & ").replace(" ou ", " | ").replace("  nao ", " !").replace("=","==");

		codigoTraduzido += `if (${condicaoTraduzida}):\n`;
	
		tabDepth++;
		return true;
	}

	if(primeiroToken == "fimse") {
		--tabDepth;
		return true;
	}

	if (primeiroToken == "senao") {
		codigoTraduzido += "else\n"
		return true;
	} 
}

const extraiCondicaoSe = (linha, comeco) => {
	if (linha.trimEnd().endsWith("entao")) {
		return linha.trimEnd().substring(comeco, linha.trimEnd().length - 5).trim();
	}
	else {
		naoEsperado(linha, linha.length - 5, 0);
		alert("ERRO: Esperava 'entao'");
	}

	return false;
}

const insertTabs = () => {
	for (let i = 0; i < tabDepth; i++) {
		codigoTraduzido += "\t";
	}
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


return processa;
})()