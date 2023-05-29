# Visualg syntax

## Declaração de variavel
```
    <nome> : tipo
```
Tipos: 

    inteiro: literalmente int
    
    real: literalmente double
    
    caractere ou caracter: qualquer coisa entre ""
    
    logico: VERDADEIRO ou FALSO

## Operadores aritméticos e relacionais

numero operador numero

## Se

```
   se <expressão-lógica> 
    entao
        <sequência-de-comandos>
    senao
        <sequência-de-comandos>
    fimse
```

## Para
```
para <variável> de <valor-inicial> ate <valor-limite> passo <incremento> faca
   <sequência-de-comandos>
fimpara
```

passo incremento é opcional, o valor default é 1

interrompa = break
## Enquanto
```
enquanto <expressão-logica> faca
   <codigo>
fimenquanto
```

interrompa = break

## Repita
```
repita
   <sequência-de-comandos>
ate <expressão-lógica>
```
interrompa = break

## Escolha
```
escolha <expressão-de-seleção>
caso <exp11>, <exp12>, ..., <exp1n>
   <sequência-de-comandos-1>
caso <exp21>, <exp22>, ..., <exp2n>
   <sequência-de-comandos-2>
...
outrocaso
   <sequência-de-comandos-extra>
fimescolha
```

## Procedimento
```
procedimento soma (x,y: inteiro)
inicio
    <faz algo que não retorna>
fimprocedimento 
```

## Função
```
funcao soma (x,y: inteiro): inteiro
inicio
    retorne x + y
fimfuncao 
```