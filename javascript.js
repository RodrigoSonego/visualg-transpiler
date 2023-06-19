const processaJs =(function() {

document.addEventListener("keydown", evt => {
	if (evt.ctrlKey) {

		if (evt.key == "Enter") { 
			if (evt.shiftKey) console.clear();
			document.getElementById("jsTabButton").click();
			processa();

			if (evt.altKey) {
				console.log("RODANDO PROGRAMA:");
				eval(programaTraduzido)
			}
			return;
		}

	} 
});


const valoresDefaultPorTipo = new Map();
valoresDefaultPorTipo.set("inteiro",  '0');
valoresDefaultPorTipo.set("real",     '0.0');
valoresDefaultPorTipo.set("caracter", '""');
valoresDefaultPorTipo.set("caractere",'""');
valoresDefaultPorTipo.set("logico",   'false');
valoresDefaultPorTipo.set("vetor",    '0;');

const reconheceTipoDeDados = tipo => valoresDefaultPorTipo.has(tipo)

const defaultDoTipo = (tipo, num) => {
	const valorDefault = valoresDefaultPorTipo.get(tipo);
	if (!num || num === 1) return valorDefault;
	let str = "[" + valorDefault;
	for (let i = 1; i < num; i++) {
		str += `,${valorDefault}`;
	}
	str += "]";
	return str;
}


const simbolos = new Set();
simbolos.add(":")
simbolos.add(",")
simbolos.add(")")
simbolos.add("(")
simbolos.add("<")
simbolos.add(">")
simbolos.add("-")
simbolos.add("=")
// visualg nao tem esses
// simbolos.add("&")
// simbolos.add("|")

const ehSimbolo = char => simbolos.has(char);



const reservadas = new Set();
reservadas.add("se")
reservadas.add("entao")
reservadas.add("senao")
reservadas.add("fimse")

reservadas.add("para")
reservadas.add("de")
reservadas.add("ate")
reservadas.add("passo")
reservadas.add("faca")
reservadas.add("fimpara")
reservadas.add("enquanto")
reservadas.add("fimenquanto")

// reservadas.add("repita")
// reservadas.add("fimrepita")

// const reservadas = new Map();
// reservadas.set("se",          "if");
// reservadas.set("entao",       "");
// reservadas.set("senao",       "else");
// reservadas.set("fimse",       "");
// reservadas.set("enquanto",    "while");
// reservadas.set("fimenquanto", "");
// reservadas.set("repita",      "do");
// reservadas.set("ate",         "while");
// reservadas.set("fimrepita",   "");


const ehReservada = char => reservadas.has(char);



const jsOutput = document.getElementById("jsOutput");
let programaTraduzido = "";


const processa = () => {
	programaTraduzido = "";
	traduzJavascript();
}


// dentro da string é que nem amor e guerra, vale tudo
const traduzJavascript = () => {
	const textoDaIde = editor.getValue();

	/** @type {Array.<string>} */
	const linhas = textoDaIde.split("\n");

	const iPrimeiraLinhaValida = pegaIndiceDaProximaLinhaNaoVazia(linhas, 0);
	const nenhumaLinhaValida = iPrimeiraLinhaValida === linhas.length;
	if (nenhumaLinhaValida) {
		console.error(`Linha 1: Sintaxe incorreta (programa vazio)`);
		return;
	}

	// aqui sabemos que tem alguma linha válida
	const primeiraLinha = linhas[iPrimeiraLinhaValida];
	if (!transpilaPrimeiraLinhaValida(primeiraLinha, iPrimeiraLinhaValida)) return;

	let comecoDaProximaLinhaBoa = 0;
	comecoDaProximaLinhaBoa = pegaIndiceDaProximaLinhaNaoVazia(linhas, iPrimeiraLinhaValida + 1);
	if (comecoDaProximaLinhaBoa === linhas.length) { erroEsperava("INICIO", linhas.length-1); return; }

	const linhaQAchouInicio = transpilaAteInicio(linhas, comecoDaProximaLinhaBoa);
	if (!linhaQAchouInicio) return;

	programaTraduzido += "\n\n";

	// inicio
	if (!transpilaLinhasAteFimAlgoritmo(linhas, linhaQAchouInicio + 1)) {
		jsOutput.value	= ""
		return;
	}

	console.log(`TRANSPILOU COM SUCESSO`);
	jsOutput.value = programaTraduzido;

}


/** @param {String} linha  @param {Number} indiceProximaLinha  @returns {Boolean} */
const transpilaLinhasAteFimAlgoritmo = (linhas, indiceProximaLinha) => {
	let i;
	for (i = indiceProximaLinha; i < linhas.length; ++i) {
		const linha = linhas[i];
		if (estaEmBrancoOuComentario(linha)) continue;

		// console.log(`transpilarei linha '${linha}'`);
		let charsAteAgora = 0;
		charsAteAgora += contaEmBranco(linha, 0); // pula branco

		const primeiroToken = proxTokenNaLinha(linha, charsAteAgora);
		const primeiroTokenLower = primeiroToken.toLowerCase();
		if (primeiroTokenLower == "fimalgoritmo") return true;
		charsAteAgora += primeiroToken.length;

		const proximosTokens = tokenizaTudoNaLinhaApartirDe(linha, charsAteAgora);
		
		// console.log(`tokens: 0: '${primeiroToken}' 1: '${agrega(proximosTokens, "' '")}'`);
		
		// const proxToken = proximosTokens[0];
		// somente um token na linha, é um statement (por ex. repita) ou uma funçao

		if (primeiroTokenLower === "se") {
			// TODO: dava pra fazer o se transpilar os proprios tokens, menos retrabalho
			const linhaQueOSeTerminou = transpilaSe(linhas, i, charsAteAgora, proximosTokens);
			if (linhaQueOSeTerminou === false) { return false; }

			// continue vai rodar ++i
			i = linhaQueOSeTerminou;
			continue;
		}

		const indentacao = 0
		if (!transpilaLinhaSimples(primeiroToken, proximosTokens, indentacao)) return;
	}

	erroEsperava("FIMALGORITMO", i - 1);
	return false;
}

/** @param {String} linha  @param {Array.<String>} proximosTokens  @returns {Boolean|Number} */
const transpilaAtribuicao = (identificador, proximosTokens) => {
	proximosTokens = corrigeOperadores(proximosTokens);
	programaTraduzido += identificador.toLowerCase() + " = " + agrega(proximosTokens, " ") + ";\n";
}

/** @param {String} linha  @param {Array.<String>} proximosTokens  @returns {Boolean|Number} */
const transpilaChamadaFuncao = (identificador, proximosTokens) => {
	proximosTokens = corrigeOperadores(proximosTokens);
	identificador = traduzNomeDeFuncao(identificador);
	programaTraduzido += identificador.toLowerCase() + agrega(proximosTokens, "") + ";\n";
}

const corrigeOperadores = tokens => {
	for (let i = 0; i < tokens.length; i++) {
		// TODO: funçao "troca = por ==="
		const token = tokens[i];
		if (token.startsWith('"')) continue;
		tokens[i] = traduzOperador(token.toLowerCase());
	}
	return tokens;
}

/**
 * @param {Array.<String>} linhas 
 * @param {Number} indiceLinhaDoSe 
 * @param {Number} charsAteAgora 
 * @param {Array.<String>} proximosTokensDoSe 
 * @returns {Boolean|Number} linha que ele terminou de parsar o if ou false
 */
const transpilaSe = (linhas, indiceLinhaDoSe, charsAteAgora, proximosTokensDoSe) => {
	// 'charsAteAgora' começa logo após o se
	const linhaDoSe = linhas[indiceLinhaDoSe];
	charsAteAgora += contaEmBranco(linhaDoSe, charsAteAgora); // pula brancos

	// se
	programaTraduzido += "\nif (";

	proximosTokensDoSe = corrigeOperadores(proximosTokensDoSe);
	const ultimoToken = proximosTokensDoSe[proximosTokensDoSe.length - 1];
	if (ultimoToken !== "entao") { erroEsperava("ENTAO", indiceLinhaDoSe, charsAteAgora, linhaDoSe.length - charsAteAgora); return false; }

	for (let i = 0; i < proximosTokensDoSe.length - 1; i++) {
		const proxTokenLower = toLowerSeNaoForString(proximosTokensDoSe[i]);
		// pode ter aqui um entao inesperado
		if (proxTokenLower === "entao") { erroNaoEsperava(indiceLinhaDoSe, linhaDoSe.toLowerCase().indexOf("entao"), 5); return false; }
		
		programaTraduzido += traduzOperador(proxTokenLower);
		if (i !== proximosTokensDoSe.length - 2) programaTraduzido += " ";
	}
	programaTraduzido += ") {\n";

	// senao / fimse
	let iLinha;
	for (iLinha = indiceLinhaDoSe + 1; iLinha < linhas.length; ++iLinha) {
		
		charsAteAgora = 0;
		const linha = linhas[iLinha];
		if (estaEmBrancoOuComentario(linha)) continue;
		
		charsAteAgora += contaEmBranco(linha, charsAteAgora); // pula brancos
		
		const primeiroToken = proxTokenNaLinha(linha, charsAteAgora);
		// console.log("transpilando '" + linha + "' tok: ' " + primeiroToken);
		if (primeiroToken === "senao") {
			programaTraduzido += "} else {\n";
			continue;
		}
		
		if (primeiroToken === "fimse") {
			programaTraduzido += "}\n\n";
			return iLinha+1;
		}

		charsAteAgora += primeiroToken.length;

		const indentacao = 1;
		const proximosTokens = tokenizaTudoNaLinhaApartirDe(linha, charsAteAgora);
		if (!transpilaLinhaSimples(primeiroToken, proximosTokens, indentacao)) return false;
	}

	// return iLinha;

	erroEsperava("FIMSE", iLinha - 1);
	return false;
}

const transpilaLinhaSimples = (primeiroToken, proximosTokens, indentacao) => {
	
	for (let i = 0; i < indentacao; i++) {
		programaTraduzido += "    ";
	}
	
	const proxToken = proximosTokens[0];
	if (proxToken === false) {
			
		// "repita" pode estar sozinha na linha
		const primTokLow = primeiroToken.toLowerCase();
		if (ehReservada(primTokLow)) { erroSintaxe(i, charsAteAgora - primeiroToken.length, primeiroToken.length); return false; }

		programaTraduzido += traduzNomeDeFuncao(primTokLow) + "();\n";
		return true;
	}


	// funcao()
	if (proxToken === "()") {
		programaTraduzido += traduzNomeDeFuncao(primeiroToken.toLowerCase()) + "();\n";
		return true;
	}

	// funcao(width * 2)
	if (proxToken === "(") {
		transpilaChamadaFuncao(primeiroToken, proximosTokens);
		return true;
	}

	// algo <-
	// algo :=
	if (ehAtribuidor(proxToken)) {
		// charsAteAgora += proxToken.length;
		proximosTokens.shift(); // remove o <-
		transpilaAtribuicao(primeiroToken, proximosTokens);
		return true;
	}

	return true;
}

const mapaDeOperadores = new Map();
mapaDeOperadores.set("=",          "===");
mapaDeOperadores.set("e",          "&&");
mapaDeOperadores.set("ou",         "||");
mapaDeOperadores.set("nao",        "!");
mapaDeOperadores.set("falso",      "false");
mapaDeOperadores.set("verdadeiro", "true");

const traduzOperador = token => {
	// TODO: isso vai fazer duas operações para pegar o item, da pra fazer somente o get acho
	if (mapaDeOperadores.has(token))
		return mapaDeOperadores.get(token);
	return token;
}

const toLowerSeNaoForString = token => {
	if (token.startsWith('"')) return token;
	return token.toLowerCase();
}

const traduzNomeDeFuncao = nome => {
	// TODO: hashtable aqui (new Map())
	switch (nome) {
		case "escreva":
		case "escreval":
			return "console.log"
		default:
			return nome;
	}
}


/** @param {String} linha  @returns {Boolean|Number} */
const transpilaAteInicio = (linhas, indicePrimeiraProxLinha) => {
	const linha = linhas[indicePrimeiraProxLinha];
	let charsAteAgora = contaEmBranco(linha, 0); // pula branco

	// primeiro token pode ser "inicio" ou "var"
	const token = proxTokenNaLinha(linha, charsAteAgora);
	const tokenLower = token.toLowerCase();

	if (tokenLower == "inicio") {

		if (!erroSeInicioTiverAlgoDpsDele(linha, indicePrimeiraProxLinha)) return false;

		return indicePrimeiraProxLinha;
	}

	if (tokenLower == "var") {

		charsAteAgora += token.length;

		// pode ter vars válidos na propria linha que contém o var
		if (!parsaVariaveisNaLinha(linha, charsAteAgora, indicePrimeiraProxLinha)) return false;

		let indiceProximaLinha = indicePrimeiraProxLinha;
		while (true) {
			
			indiceProximaLinha += 1;
			indiceProximaLinha = pegaIndiceDaProximaLinhaNaoVazia(linhas, indiceProximaLinha);
			if (indiceProximaLinha == linhas.length) { erroEsperava("Inicio ou variaveis", indiceProximaLinha-1); return false; }

			// console.log(`prox linha '${linhas[indiceProximaLinha]}'`);
			const proxLinhaValida = linhas[indiceProximaLinha];
			if (comecaComInicio(proxLinhaValida)) {
				if (!erroSeInicioTiverAlgoDpsDele(proxLinhaValida, indiceProximaLinha)) return false;

				return indiceProximaLinha;
			}

			if (!parsaVariaveisNaLinha(proxLinhaValida, 0, indiceProximaLinha)) return false;
		}
		// indiceProximaLinha eventualmente dará linhas.length ou achará início
		// entáo não dará loop infinito e nada depois desse while vai ser chamado
	}

	erroNaoEsperava(indicePrimeiraProxLinha, charsAteAgora, token.length);
	// console.error(`Linha ${indiceDela+1}: Token nao identificado '${token}' esperava 'var' ou 'inicio'`);
	return false;
}

/** @param {String} linha  @returns {Boolean} */
const erroSeInicioTiverAlgoDpsDele = (linha, indiceDela) => {
	let charsAteAgora = contaEmBranco(linha, 0); // pula brancos
	
	// primeiro token é inicio
	const tokenInicio = proxTokenNaLinha(linha, charsAteAgora);
	if (tokenInicio.toLowerCase() !== "inicio") console.error("ERROZÃO");
	charsAteAgora += tokenInicio.length;
	
	charsAteAgora += contaEmBranco(linha, charsAteAgora); // pula brancos

	const proxToken = proxTokenNaLinha(linha, charsAteAgora);
	// espera-se que nao exista proximo token na linha, que ele seja false
	if (proxToken !== false) {
		erroNaoEsperava(indiceDela, charsAteAgora, proxToken.length);
		return false;
	}

	return true;
}

const comecaComInicio = linha => {
	let brancosAteAgora = contaEmBranco(linha, 0);
	let proxToken = proxTokenNaLinha(linha, brancosAteAgora);
	return proxToken.toLowerCase() === "inicio";
}

/** @param {String} linha  @param {Number} charsAteAgora  @param {Number} indiceDela */
const parsaVariaveisNaLinha = (linha, charsAteAgora, indiceDela) => {
	/** @type {String|boolean} */
	let proxToken = false;

	while (true) {

		charsAteAgora += contaEmBranco(linha, charsAteAgora); // pula branco
		
		// nome da variavel
		proxToken = proxTokenNaLinha(linha, charsAteAgora)
		if (proxToken === false) break; // tem mais nada na linha, ta de boa
		if (ehSimbolo(proxToken)) { erroNaoEsperava(indiceDela, charsAteAgora, proxToken.length); return false; } // tiver algo, espera-se nome de variável, não símbolo

		let nomeDoBaguio = proxToken;
		charsAteAgora += proxToken.length;

		charsAteAgora += contaEmBranco(linha, charsAteAgora); // pula branco

		let qtdVars = 1;
		// var1,var2,var3,
		proxToken = proxTokenNaLinha(linha, charsAteAgora)
		while (proxToken === ",") {
			qtdVars += qtdVars;

			charsAteAgora += proxToken.length;
			charsAteAgora += contaEmBranco(linha, charsAteAgora); // pula branco

			const proxNomeDeVar = proxTokenNaLinha(linha, charsAteAgora);
			if (proxNomeDeVar === false || ehSimbolo(proxNomeDeVar)) { erroNaoEsperava(indiceDela, charsAteAgora, proxNomeDeVar.length); return false; }

			nomeDoBaguio += "," + proxNomeDeVar;
			charsAteAgora += proxNomeDeVar.length;

			charsAteAgora += contaEmBranco(linha, charsAteAgora); // pula branco

			proxToken = proxTokenNaLinha(linha, charsAteAgora)
		}

		// var4:
		if (proxToken !== ":") { erroNaoEsperava(indiceDela, charsAteAgora, proxToken.length); return false; }
		charsAteAgora += proxToken.length;

		charsAteAgora += contaEmBranco(linha, charsAteAgora); // pula branco
		proxToken = proxTokenNaLinha(linha, charsAteAgora)

		if (proxToken === false || !reconheceTipoDeDados(proxToken)) { erroTipoRuim(proxToken ? proxToken : "", indiceDela, charsAteAgora, proxToken.length); return false; }

		charsAteAgora += proxToken.length;
		const tipoDoBaguio = proxToken;
		
		if (proxToken.toLowerCase() === "vetor") {
			// dava pra parsar o resto do vetor aqui mas foda-se
			programaTraduzido += `let ${nomeDoBaguio} = []; // TODO: Array(n).fill(default)\n`.toLowerCase();

			// TODO: implementa
			parsaVetor(linha, charsAteAgora, indiceDela);
		
		} else {

			let conteudo;
			if (qtdVars > 1)
				conteudo = `let [${nomeDoBaguio}] = ${defaultDoTipo(tipoDoBaguio, qtdVars)}; // ${tipoDoBaguio}\n`;
			else
				conteudo = `let ${nomeDoBaguio} = ${defaultDoTipo(tipoDoBaguio)}; // ${tipoDoBaguio}\n`;
			programaTraduzido += conteudo.toLowerCase();
		}

		// charsAteAgora += contaEmBranco(linha, charsAteAgora); // pula branco	
	}

	return true;
}

/** @param {String} linha  @param {Number} charsAteAgora  @param {Number} indiceDela */
const parsaVetor = (linha, charsAteAgora, indiceDela) => {
	console.error("TODO: implementar versão com vetores!");
}


/** @param {Array.<String>} tokens  @param {String} separador  @returns {String} */
const agrega = (tokens, separador) => {
	if (tokens.length == 0) return ""
	if (tokens.length == 1) return tokens[0];
	let aggr = "";
	for (let i = 0; i < tokens.length - 1; ++i) {
		aggr += tokens[i];
		aggr += separador;
	}
	aggr += tokens[tokens.length - 1];
	return aggr;
}


/** @param {String} linha  @param {Number} indiceDela  @returns {Boolean} */
const transpilaPrimeiraLinhaValida = (linha, indiceDela) => {
	const charsEmBranco = contaEmBranco(linha, 0);
	linha = linha.substring(charsEmBranco);

	const primeiroToken = proxPalavra(linha, 0);
	console.assert(primeiroToken !== false)
	if (primeiroToken.toLowerCase() != "algoritmo") {
		console.error(`Linha ${indiceDela+1}: Comando fora da seção apropriada`);
		return false;
	}
	
	let charsAteAgora = primeiroToken.length;
	charsAteAgora += contaEmBranco(linha, charsAteAgora);

	const segundoToken = proxPalavra(linha, charsAteAgora);
	if (!ehString(segundoToken)) {
		console.error(`Linha ${indiceDela+1}: Sintaxe incorreta`);
		return false;
	}

	programaTraduzido += "// programa " + segundoToken + "\n\n";

	charsAteAgora += segundoToken.length;
	const terceiroToken = proxPalavra(linha, charsAteAgora);
	if (terceiroToken !== false) {
		console.error(`Linha ${indiceDela+1}: Token nao identificado '${terceiroToken}'`);
	}

	return true;
}

/** @param {String} token  @returns {Boolean}  */
const ehString = token => {
	return token.startsWith("\"");
}

/** @param {String} linha  @param {Number} comeco */
const contaEmBranco = (linha, comeco) => {
	let i;
	for (i = comeco; i < linha.length; ++i) {
		const char = linha[i];
		if (ehSkipavel(char)) continue;
		return i - comeco;
	}
	return i - comeco;
}

/** @param {String} linha  @param {Number} comeco  @returns {Array.<String>} */
const tokenizaTudoNaLinhaApartirDe = (linha, comeco) => {
	const tokens = [];

	// tokens sempre acabam em false
	if (comeco === linha.length) tokens.push(false);

	let i; // i == "charsAteAgora"
	for (i = comeco; i < linha.length;) {
		i += contaEmBranco(linha, i); // pula brancos

		const token = proxTokenNaLinha(linha, i);
		tokens.push(token);
		i += token.length;
	}

	return tokens;
}

/** @param {String} linha  @param {Number} comeco  @returns {String|boolean} */
const proxTokenNaLinha = (linha, comeco) => {
	const acabou = comeco == linha.length;
	if (acabou) return false;

	const ehComentario = linha[comeco] == "/" && linha[comeco+1] == "/";
	if (ehComentario) return false;

	const primeiroChar = linha[comeco];
	if (primeiroChar == '"') {
		return extraiString(linha, comeco);
	}

	if (ehSimbolo(primeiroChar)) {
		return extraiSimbolo(linha, comeco);
		// return primeiroChar;
	}

	let i;
	for (i = comeco; i < linha.length; ++i) {
		const char = linha[i];
		// console.log(`char '${char}'`);
		if (ehSkipavel(char)) {
			// if (tokenAteAgora.length === 0) continue;
			return linha.substring(comeco, i);
		}
		
		if (ehSimbolo(char)) {
			// console.log(`simbolo em '${linha.substring(comeco, i)}'`);
			return linha.substring(comeco, i);
		}
	}

	return linha.substring(comeco, i);
}

/** @param {String} linha  @param {Number} comeco  @returns {String|boolean} */
const proxPalavra = (linha, comeco) => {
	// console.log(`catando prox palavra em '${linha}'`);
	const acabou = comeco == linha.length;
	if (acabou) return false;

	if (linha[comeco] == "/" && linha[comeco+1] == "/") {
		return false;
	}

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

/** @param {String} linha  @param {Number} comeco  @returns {String|boolean} */
const extraiString = (linha, comeco) => {
	// console.log(`extraindo string de ${linha.substring(comeco)}`);
	let i;
	for (i = comeco + 1; i < linha.length; ++i) {
		const char = linha[i];
		if (char == '"') return linha.substring(comeco, i + 1);
	}
	
	// string nao fechada, em visualg isso é válido
	return false;
}

// TODO: precisa?
/** @param {String} linha  @param {Number} comeco  @returns {String|boolean} */
const extraiSimbolo = (linha, comeco) => {
	let i;
	for (i = comeco; i < linha.length; ++i) {
		const char = linha[i];
		if (!ehSimbolo(char)) break;
	}

	return linha.substring(comeco, i);
}

const ehSkipavel   = char  => char  === " "  || char  === "\t";
const ehAtribuidor = token => token === ":=" || token === "<-";


/** @return {Number} */
const pegaIndiceDaProximaLinhaNaoVazia = (linhas, comeco) => {
	let i;
	for (i = comeco; i < linhas.length; ++i) {
		const linha = linhas[i];
		if (estaEmBrancoOuComentario(linha)) continue;

		return i;
	}

	return i;
}

const estaEmBrancoOuComentario = string => {
	for (let i = 0; i < string.length; ++i) {
		const char = string[i];
		if (char == "/") {
			if (string[i+1] == "/")
				return true;
			return false;
		}

		if (!ehSkipavel(char)) return false;
	}
	return true;
}

const erroNaoEsperava = (indiceLinha, indiceColuna, tamanhoToken) => {
	console.error(`token nao esperado na linha '${indiceLinha+1}' coluna '${indiceColuna}'`);
	atualizaCursorNoErro(indiceLinha, indiceColuna, tamanhoToken);
}

const erroTipoRuim = (tipo, indiceLinha, indiceColuna, tamanhoToken) => {
	console.error(`tipo ruim "${tipo}" na linha '${indiceLinha+1}' coluna '${indiceColuna}'`);
	atualizaCursorNoErro(indiceLinha, indiceColuna, tamanhoToken);
}

const erroEsperava = (oqueEsperava, indiceLinha, indiceColuna, tamanhoToken) => {
	console.error(`esperava "${oqueEsperava}" na linha '${indiceLinha+1}' coluna '${indiceColuna ?? 0}'`);
	atualizaCursorNoErro(indiceLinha, indiceColuna, tamanhoToken);
}

const erroSintaxe = (indiceLinha, indiceColuna, tamanhoToken) => {
	console.error(`erro de sintaxe na linha '${indiceLinha+1}' coluna '${indiceColuna ?? 0}'`);
	atualizaCursorNoErro(indiceLinha, indiceColuna, tamanhoToken);
}

const atualizaCursorNoErro = (indiceLinha, indiceColuna, tamanhoToken) => {
	if (!tamanhoToken) tamanhoToken = 0;
	if (!indiceColuna) indiceColuna = 0;
	editor.selection.$setSelection(indiceLinha, indiceColuna, indiceLinha, indiceColuna + tamanhoToken);
}

return processa;
})()


// fonte: https://visualg3.com.br/tabelas/

// TODO: até, então, faça, não, senão
// const palavrasReservadas = [
// 	"aleatorio",
// 	"algoritmo",
// 	"arquivo",
// 	"asc",
// 	"ate",
// 	"carac",
// 	"caracpnum",
// 	"caracter",
// 	"caractere",
// 	"caso",
// 	"compr",
// 	"copia",
// 	"cronometro",
// 	"debug",
// 	"div",
// 	"e",
// 	"eco",
// 	"enquanto",
// 	"entao",
// 	"escolha",
// 	"escreva",
// 	"escreval",
// 	"faca",
// 	"falso",
// 	"fimalgoritmo",
// 	"fimenquanto",
// 	"fimescolha",
// 	"fimfuncao",
// 	"fimpara",
// 	"fimprocedimento",
// 	"fimrepita",
// 	"fimse",
// 	"funcao",
// 	"inicio",
// 	"int",
// 	"inteiro",
// 	"interrompa",
// 	"leia",
// 	"limpatela",
// 	"logico",
// 	"maiusc",
// 	"minusc",
// 	"mod",
// 	"mudacor",
// 	"nao",
// 	"numpcarac",
// 	"ou",
// 	"outrocaso",
// 	"para",
// 	"passo",
// 	"pausa",
// 	"pos",
// 	"procedimento",
// 	"real",
// 	"repita",
// 	"retorne",
// 	"se",
// 	"senao",
// 	"timer",
// 	"var",
// 	"verdadeiro",
// 	"vetor",
// 	"xou",
// ]

// const operadoresAritimeticos = [
// 	"^",
// 	"*",
// 	"/",
// 	"\\",
// 	"+",
// 	"-",
// 	"*",
// ]

// const operadoresRelacionais = [
// 	">",
// 	"<",
// 	"=",
// 	">=",
// 	"<=",
// 	"<>",
// ]

// const operadoresLogicos = [
// 	"nao",
// 	"ou",
// 	"e",
// 	"xou",
// ]
