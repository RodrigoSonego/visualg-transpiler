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


document.addEventListener("keydown", evt => {
	if (evt.ctrlKey) {

		if (evt.key == "Enter") { 
			if (evt.shiftKey) console.clear();
			document.getElementById("jsTabButton").click();
			processa();
			return;
		}
		
	} 
});


const valoresDefaultPorTipo = new Map();

valoresDefaultPorTipo.set("inteiro",  "0");
valoresDefaultPorTipo.set("real",     "0.0");
valoresDefaultPorTipo.set("caracter", "\"\"");
valoresDefaultPorTipo.set("caractere","\"\"");
valoresDefaultPorTipo.set("logico",   "false");
valoresDefaultPorTipo.set("vetor",    "0; // TODO! inicializaVetor()");

const reconheceTipoDeDados = tipo => {
	return valoresDefaultPorTipo.has(tipo)
}

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

let programaTraduzido = "";
// const mapaDosVar = new Map();


const processa = () => {
	programaTraduzido = "";
	// mapaDosVar.clear();

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
	const proxLinha = linhas[comecoDaProximaLinhaBoa];

	const linhaQAchouInicio = transpilaAteInicio(proxLinha, comecoDaProximaLinhaBoa, linhas);
	if (!linhaQAchouInicio) return;

	console.log(`DEU BOM na linha ${(linhaQAchouInicio+1)}: '${linhas[linhaQAchouInicio]}'`);
	programaTraduzido += "\n\n";

	// inicio

	document.getElementById("jsOutput").value = programaTraduzido;
	
	for (let i = iPrimeiraLinhaValida; i < linhas.length; ++i) {
		const linha = linhas[i];
		if (estaEmBrancoOuComentario(linha)) continue;
		
		console.log(`transpilarei linha '${linha}'`);	
		// tokenizaLinha(linha);
	}


}

/** @param {String} linha  @param {Number} indiceDela  @returns {Boolean|Number} */
const transpilaAteInicio = (linha, indiceDela, linhas) => {
	let charsAteAgora = contaEmBranco(linha, 0);

	// primeiro token pode ser "inicio" ou "var"
	const token = proxTokenNaLinha(linha, charsAteAgora);
	const tokenLower = token.toLowerCase();

	if (tokenLower == "inicio") {

		// achou de cara, nao teve vars
		charsAteAgora += token.length;
		// charsAteAgora += contaEmBranco(linha, charsAteAgora); // pula branco

		if (!erroSeInicioTiverAlgoDpsDele(linha, indiceDela)) return false;

		return indiceDela;
	}

	if (tokenLower == "var") {

		charsAteAgora += token.length;

		// pode ter vars válidos na propria linha que contém o var
		if (!parsaVariaveisNaLinha(linha, charsAteAgora, indiceDela)) return false;

		let indiceProximaLinha = indiceDela;
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

	erroNaoEsperava(indiceDela, charsAteAgora, token.length);
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
			programaTraduzido += `let ${nomeDoBaguio} = []; // tipo vetor\n`.toLowerCase();
		
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


/** @param {Array.<String>} tokens  @param {String} separador  @returns {String} */
const agregaTokens = (tokens, separador) => {
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

/** @param {String} linha  @param {Number} comeco  @returns {String|boolean} */
const proxTokenNaLinha = (linha, comeco) => {
	const acabou = comeco == linha.length;
	if (acabou) return false;

	if (linha[comeco] == "/" && linha[comeco+1] == "/") {
		return false;
	}

	// console.log(`TOKENIZAR '${linha.substring(comeco)}'`);
	const primeiroChar = linha[comeco];
	if (primeiroChar == "\"") {
		return extraiString(linha, primeiroChar);
	}

	if (ehSimbolo(primeiroChar)) {
		return primeiroChar;
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
		if (char == "\"") return linha.substring(comeco, i+1);
	}
	
	// string nao fechada, em visualg isso é válido
	return false;
}

const ehSkipavel = char => {
	return char === ' ';
}
const ehSimbolo = char => {
	return char === ':' || char === ",";
}

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

		if (char != " ") return false;
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

const atualizaCursorNoErro = (indiceLinha, indiceColuna, tamanhoToken) => {
	if (!tamanhoToken) tamanhoToken = 0;
	if (!indiceColuna) indiceColuna = 0;
	editor.selection.$setSelection(indiceLinha, indiceColuna, indiceLinha, indiceColuna + tamanhoToken);
}

return processa;
})()