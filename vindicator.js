var COMANDOS_QUANTIDADE = 0;
var LAST_RESULT = 0;
var VARIAVEIS = new Map()
var BINARY_OPERATIONS = ['+','-','*','/','%','log','pow','eq','dif','gt','lt','and','or']
var UNITARY_OPERATIONS = ['sqrt','abs','floor','ceil','exp','print','not']
var DECLARATIONS = ['set','vec']

function executeCommand(code=null, output=null, quantidade=0){
    let comando = code==null ? document.getElementById("comando").value : code;
    let resultados = output==null ? document.getElementById("results") : output;
    // Comando esperado: Op Arg1 Arg2
    comando = comando.trim();
    comando = comando.split(' ');

    operador = comando[0].toLowerCase();
    argumentos = comando.slice(1);
    
    let res = evaluate(operador, argumentos, resultados);

    if (COMANDOS_QUANTIDADE >= 10) {
        resultados.innerText = '';
    }

    quantidade = operador == 'print' ? 0 : quantidade;
    returnResult(resultados, res, quantidade);
}

function returnResult(resultados, resul, quantidade){
    if (quantidade > 0){
        resultados.innerText += COMANDOS_QUANTIDADE == quantidade-1 ? `> ${resul}\n` : '';
    }
    else {
        resultados.innerText += `> ${resul}\n`;
    }
    COMANDOS_QUANTIDADE += 1;
}

function clearQuantidade() {
    COMANDOS_QUANTIDADE = 0;
}

function get_number(arg){
    if (arg == '_') {
        return LAST_RESULT;
    }
    if (arg.indexOf('e') != -1) {
        return Number(arg.split('e')[0]) * (Math.pow(10, Number(arg.split('e')[1])))
    }
    if (VARIAVEIS.get(arg) != undefined) {
        return VARIAVEIS.get(arg)
    }
    if (arg.indexOf('/') != -1) {
        return Number(arg.split('/')[0]) / Number(arg.split('/')[1])
    }

    return Number(arg);
}

function doBinaryOperation (op, arg1, arg2) {
    let aritmetica = 0
    if(op=='+'){ aritmetica = arg1 + arg2}
    else if(op=='-'){ aritmetica = arg1 - arg2}
    else if(op=='*'){ aritmetica = arg1 * arg2}
    else if(op=='/'){ aritmetica = arg2 != 0 ? arg1 / arg2 : `Error: can't divide by zero`}
    else if(op=='%'){ aritmetica = arg1 % arg2}
    else if(op=='pow'){ aritmetica = Math.pow(arg1,arg2)}
    else if(op=='log'){ aritmetica = Math.log(arg2) / Math.log(arg1)}
    else if(op == 'eq'){ aritmetica = arg1 == arg2 ? 1 : 0 }
    else if(op == 'dif'){ aritmetica = arg1 != arg2 ? 1 : 0 }
    else if(op == 'gt'){ aritmetica = arg1 > arg2 ? 1 : 0 }
    else if(op == 'lt'){ aritmetica = arg1 < arg2 ? 1 : 0 }
    else if(op == 'and'){ aritmetica = arg1 && arg2 ? 1 : 0 }
    else if(op == 'or'){ aritmetica = arg1 || arg2 ? 1 : 0 }

    return aritmetica
}

function doUnirayOperation (op, argument) {
    let aritmetica = 0

    if (op == 'sqrt'){ aritmetica = Math.sqrt(argument) }
    else if (op == 'abs'){ aritmetica = Math.abs(argument) }
    else if (op == 'ceil'){ aritmetica = Math.ceil(argument) }
    else if (op == 'floor'){ aritmetica = Math.floor(argument) }
    else if (op == 'exp'){ aritmetica = Math.exp(argument) }
    else if (op == 'print'){ aritmetica = argument }
    else if (op == 'not'){ aritmetica = argument * -1 }

    return aritmetica
}

function doDeclaration (op, name, args) {
    if (op == 'set') {
        let valores = args

        VARIAVEIS.set(name, get_number(valores));
        return 1;
    }

    if (op == 'vec') {
        let valores = []

        for(let i=0; i<args.length; i+=1){ valores.push(get_number(args[i])) }

        VARIAVEIS.set(name, valores);
        return 1;
    }
}

function executeOperationOnArray (op, type, args) {
    if (type == 'UNARY') {
        let argumento = get_number(args[0])
        let resul = []

        for(let i=0; i<argumento.length; i+=1){ resul.push(doUnirayOperation(op, argumento[i])) }

        return resul
    }
    else if (type == 'BINARY') {
        if (args.length == 2){
            let argumento = get_number(args[0])
            let argumento2 = get_number(args[1]);

            if (argumento.length != argumento2.length) {
                if (typeof argumento2 == 'number') {
                    let resul = []
                    for(let i=0; i<argumento.length; i+=1){ resul.push(doBinaryOperation(op, argumento[i], argumento2)) }
                    return resul
                }
                return 'ERROR: vectors must have the same length'
            }
            else {
                let resul = []
                for(let i=0; i<argumento.length; i+=1){ resul.push(doBinaryOperation(op, argumento2[i], argumento[i])) }
                return resul
            }
        }
        else {
            let argumento = get_number(args[0])
            let resul = 0;
            for(let i=0; i<argumento.length; i+=1){ resul = doBinaryOperation(op, resul, argumento[i]) }
            return resul
        }
    }
}


function evaluate(op, args, resultados){
    resultados.innerText += `[${COMANDOS_QUANTIDADE}] ${op}, ${args}:\n`
    //1 == True ; 0 == False
    if (DECLARATIONS.includes(op)){
        let aritmetica = doDeclaration(op, args[0], args.slice(1, args.length))

        LAST_RESULT = aritmetica;
        return aritmetica;
    }
    else if (UNITARY_OPERATIONS.includes(op)) {
        let argument = get_number(args[0])

        aritmetica = doUnirayOperation(op, argument)

        LAST_RESULT = aritmetica;
        return aritmetica;
    }
    else if (BINARY_OPERATIONS.includes(op)) {
        let arg1 = get_number(args[0])
        let arg2 = get_number(args[1])

        aritmetica = doBinaryOperation(op, arg1, arg2)

        LAST_RESULT = aritmetica;
        return aritmetica;
    }
    else if (op.indexOf('$') != -1) {
        if (UNITARY_OPERATIONS.includes(op.slice(1))) {
            aritmetica = executeOperationOnArray(op.slice(1), 'UNARY', args)
            LAST_RESULT = aritmetica;
            return aritmetica;
        }
        else if (BINARY_OPERATIONS.includes(op.slice(1))) {
            aritmetica = executeOperationOnArray(op.slice(1), 'BINARY', args)
            LAST_RESULT = aritmetica;
            return aritmetica;
        }
    }

    return 'ERROR: Operation Undefined';
}